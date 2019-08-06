import { createHash } from 'crypto';
import React from 'react';
import DOMPurify from 'dompurify';
import Identicon from 'identicon.js';
import marked from 'marked';
import logo from './logo.svg';
import API from './API';
import './App.css';

const IS_DEV = process.env.NODE_ENV !== 'production';
const BASE_URL = IS_DEV ? 'http://localhost:5000' : '';

// - - -

const api = new API(BASE_URL);

// - - -

const tokenFromURL = () => {
  const tokenMatch = window.location.pathname.match(/^\/t\/(\w+)$/);
  return tokenMatch ? tokenMatch[1] : null;
}

const getJWT = async () => {
  const token = tokenFromURL();

  if (token) {
    const response = await api.authenticate(token);

    if (typeof response.jwt === 'string') {
      localStorage.setItem('jwt', response.jwt);
      window.location.pathname = "/";
    } else {
      localStorage.removeItem('jwt');
    }
  }

  return localStorage.getItem('jwt');
}

const getIdenticonSrc = (hash, size) => {
  const options = {
    // foreground: [0, 0, 0, 255],
    background: [255, 255, 255, 255],
    margin: 0.2,
    size,
    format: 'png'
  };

  const data = new Identicon(hash, options).toString();
  return `data:image/svg+xml;base64,${data}`
}

// - - -

class Entry extends React.Component {
  constructor() {
    super();
    this.state = {
      view: 'content' // 'content' | 'json'
    };
  }

  render() {
    const { entry } = this.props;

    const raw_html = marked(entry.contents[0].markdown);
    const sane_html = DOMPurify.sanitize(raw_html);
    const tokenIdHash = createHash('md5').update(entry.token_id).digest("hex")
    const identiconSrc = getIdenticonSrc(tokenIdHash, 64);

    return (
      <div className="entry" key={entry.id}>
        <header>
          <span className="entry-id">#{entry.id}</span>
          <span className="created-utc">{
            new Date(entry.created_utc).toLocaleString()
          }</span>
          <div className="toggle-button"
               onClick={() => this.setState({
                 view: this.state.view === 'json' ? 'content' : 'json'
               })}
          >
            <span>{this.state.view === 'json' ? 'content' : 'json'}</span>
          </div>
        </header>
        <div className="contents">
          {this.state.view === 'json' ? (
             <pre>
               {JSON.stringify(entry, null, 4)}
             </pre>
          ) : (<>
            <aside>
              <img width="64" height="64" src={identiconSrc} />
              <pre>token_id: {entry.token_id}</pre>
            </aside>
            <article dangerouslySetInnerHTML={{ __html: sane_html }} />
          </>)}
        </div>
      </div>
    );
  }
}

// - - -

class App extends React.Component {

  constructor() {
    super();

    this.state = {
      jwt: '',
      is_authenticated: false,
      errors: [],
      entries: [],
      inputs: { entry: '' }
    };
  }

  async getEntries(jwt) {
    const response = await api.getEntries(jwt);

    if (response.entries instanceof Array) {
      return this.setState({
        jwt,
        is_authenticated: true,
        entries: response.entries
      });
    } else {
      return this.setState({ is_authenticated: false });
    }
  }

  async componentDidMount() {
    const jwt = await getJWT();

    if (typeof jwt !== 'string') {
      return this.setState({
        is_authenticated: false,
        errors: [ `scan the qr code for access` ]
      });
    }

    await this.getEntries(jwt);
    setInterval(() => this.getEntries(jwt), 60000);
  }

  async addEntry(e) {
    e.preventDefault();

    const result = await api.addEntry(this.state.jwt, this.state.inputs.entry);
    this.setState({
      inputs: { entry: '' },
      entries: [ result, ...this.state.entries ]
    });
  }

  render() {
    return !this.state.is_authenticated ? (<div>
      <h1>{this.state.errors.length > 0 ? "Errors" : "Authenticating"}</h1>
      {this.state.errors.length > 0 && (
         <pre>{JSON.stringify(this.state.errors, null, 4)}</pre>
      )}
    </div>) : (
      <div>
        <form onSubmit={this.addEntry.bind(this)}>
          <textarea name="markdown"
                    value={this.state.inputs.entry}
                    onChange={(e) => this.setState({inputs: {entry: e.target.value}})}
                    placeholder="enter markdown here..." />
          <input type="submit" value="PWAAH" />
        </form>
        <div>
          {this.state.entries.map(entry => <Entry entry={entry} />)}
        </div>
      </div>
    );
  }
}

export default App;
