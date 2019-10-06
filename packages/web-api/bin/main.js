#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const Server = require('../src/server');
const Database = require('../src/db');

const DATA_DIRECTORY = process.cwd();

const config = {
  port: process.env.PORT || 5000,
  rsa_pem: {
    private_key: fs.readFileSync(process.env.PRIVATE_RSA_PEM, 'utf8'),
    public_key: fs.readFileSync(process.env.PUBLIC_RSA_PEM, 'utf8')
  },
  token: {
    keys: fs.readFileSync(process.env.TOKEN_KEYS, 'utf8').trim().split(',')
  },
  client: {
    qrWeb: {
      baseDir: path.join(process.env.BUILD_DIR, 'qr-web')
    },
    simpleLog: {
      baseDir: path.join(process.env.BUILD_DIR, 'simple-log')
    }
  },
  sqlite3: {
    filename: path.join(DATA_DIRECTORY, 'db.sqlite3')
  }
};


(async function() {
  const db = new Database(config.sqlite3.filename);

  await db.token.create();
  await db.entry.create();
  await db.content_markdown.create();

  const server = new Server(db, config);

  await server.start();
})().catch(fatal_error => {
  console.error(fatal_error)
});
