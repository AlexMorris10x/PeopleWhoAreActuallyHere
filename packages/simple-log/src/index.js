import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
// import * as serviceWorker from './serviceWorker';

import API from './API';

const IS_DEV = process.env.NODE_ENV !== 'production';
const BASE_URL = IS_DEV ? 'http://localhost:5000' : '';
const api = new API(BASE_URL);

ReactDOM.render(<App api={api} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
