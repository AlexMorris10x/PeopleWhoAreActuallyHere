import React from 'react';
import './App.css';
import Entry from './Entry';
import Header from './Header';

const tokenFromURL = () => {
  const tokenMatch = window.location.pathname.match(/^\/t\/(\w+)$/);
  return tokenMatch ? tokenMatch[1] : null;
}

const getJWT = async (api) => {
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

// - - -

class App extends React.Component {

  constructor() {
    super();

    this.state = {
      jwt: '',
      is_authenticated: false,
      errors: [],
      entries: []
    };

    this.textareaInput = React.createRef();
  }

  async getEntries(jwt) {
    const { api } = this.props;

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
    const { api } = this.props;

    const jwt = await getJWT(api);

    if (typeof jwt !== 'string') {
      return this.setState({
        is_authenticated: false,
        errors: [ `scan the qr code for access` ]
      });
    }

    await this.getEntries(jwt);
    // setInterval(() => this.getEntries(jwt), 60000);
  }

  async addEntry(e) {
    const { api } = this.props;
    e.preventDefault();

    const markdown = this.textareaInput.current.value;

    if (markdown === '') {
      return; // exit early don't submit empty forms!
    }

    const result = await api.addEntry(this.state.jwt, markdown);

    this.textareaInput.current.value = '';

    this.setState({
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
        <Header />
        <form onSubmit={this.addEntry.bind(this)}>
          <textarea name="markdown"
                    ref={this.textareaInput}
                    placeholder="enter markdown here..." />
          <input type="submit" value="PWAAH" />
        </form>
        <div>
          {this.state.entries.map(entry => <Entry key={entry.id} entry={entry} />)}
        </div>
      </div>
    );
  }
}

export default App;
