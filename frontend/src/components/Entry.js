import { createHash } from 'crypto';

import React from 'react';
import Identicon from 'identicon.js';
import marked from 'marked';
import DOMPurify from 'dompurify';

const getIdenticonSrc = (hash, size) => {
  const options = {
    // foreground: [0, 0, 0, 255],
    background: [255, 255, 255, 255],
    margin: 0.2,
    size,
    format: 'png'
  };

  const data = new Identicon(hash, options).toString();
  return `data:image/png;base64,${data}`
}

export default class Entry extends React.Component {
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
      <div className="entry">
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
              <img alt={`identicon for ${entry.token_id}`}
                   width="64"
                   height="64"
                   src={identiconSrc} />
              <pre>token_id: {entry.token_id}</pre>
            </aside>
            <article dangerouslySetInnerHTML={{ __html: sane_html }} />
          </>)}
        </div>
      </div>
    );
  }
}
