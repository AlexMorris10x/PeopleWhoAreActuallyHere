#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const Server = require('../src/server');
const Database = require('../src/db');
const cwd = process.cwd(); // store all files we create in the cwd.

const config = {
  port: process.env.PORT || 5000,
  rsa_pem: {
    private_key: fs.readFileSync(process.env.PRIVATE_RSA_PEM, 'utf8'),
    public_key: fs.readFileSync(process.env.PUBLIC_RSA_PEM, 'utf8')
  },
  token: {
    keys: fs.readFileSync(process.env.TOKEN_KEYS, 'utf8').trim().split(',')
  },
  cors: {
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type']
  },
  client: {
    qrWeb: {
      baseDir: path.join(__dirname, '..', '..', 'qr-web', 'build')
    },
    mainWeb: {
      baseDir: path.join(__dirname, '..', '..', 'frontend', 'build')
    }
  },
  sqlite3: {
    filename: path.join(cwd, 'db.sqlite3')
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
