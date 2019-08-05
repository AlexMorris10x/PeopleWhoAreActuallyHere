const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const handlers = require('./handlers');

const fs = require('fs');

const TokenGen = require('../../shared-js/TokenGen');

module.exports = class Server {
  constructor(db, options) {
    this.server;
    this.port = options.port;
    this.db = db;

    this.tokenGen = new TokenGen();
    this.tokenKeys = options.token.keys;
    this.tokenRefreshInterval;

    this.app = express();
    this.app.use(cors(options.cors));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    configureRoutes(this.app,
                    { qrWeb: options.client.qrWeb.baseDir,
                      mainWeb: options.client.mainWeb.baseDir },
                    this.tokenGen,
                    this.db,
                    { rsa_pem_publicKey: options.rsa_pem.public_key,
                      rsa_pem_privateKey: options.rsa_pem.private_key });
  }

  async start() {
    return Promise.all([
      (async () => {
        console.log('starting: web server');
        await new Promise(r => this.server = this.app.listen(this.port, r));
        console.log(`started: web server on port ${this.port}!`);
      })(),
      (async () => {
        console.log('starting: token gen (waiting for the next minute)');
        await this.tokenGen.start();
        console.log('started: token gen!');

        const refreshTokens = () => {
          for (let key of this.tokenKeys) {
            const token = this.tokenGen.generateToken(key);
            console.log(`token:`);
            console.log(`  - key:   ${key}`);
            console.log(`  - token: ${token}`);
          }
        };

        refreshTokens();
        this.tokenRefreshInterval = setInterval(refreshTokens, (60 * 1000));
      })()
    ]);
  }

  async stop() {
    return Promise.all([
      new Promise(r => this.server.close(r)),
      this.tokenGen.stop(),
      Promise.resolve(clearInterval(this.tokenRefreshInterval))
    ]);
  }
}

function configureRoutes(app, baseDir, tokenGen, db, keys) {
  // Server routes (take priority over client routing).
  app.post('/auth', handlers.auth(db, tokenGen, "noisebridge", keys.rsa_pem_privateKey));

  app.get('/entries', handlers.entry.entries(db, keys.rsa_pem_publicKey));
  app.post('/entries', handlers.entry.add(db, keys.rsa_pem_publicKey));

  app.use('/qr', express.static(baseDir.qrWeb));

  // Client routes are served in production.
  if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(baseDir.mainWeb));
    // Handle React routing, return all requests to React app
    app.get('*', (_, res) => res.sendFile(path.join(baseDir.mainWeb, 'index.html')));
  }
}
