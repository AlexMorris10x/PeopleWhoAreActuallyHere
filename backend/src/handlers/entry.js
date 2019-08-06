const jsonwt = require('jsonwebtoken');
const e = require('../error_codes');

exports.entries = (db, rsa_pem_publicKey) => async (req, res) => {
  const invalidations = [];
  const { jwt } = req.query;

  if (typeof jwt !== 'string') {
    invalidations.push(e.missing_parameter('jwt'));
  }

  let decoded_jwt;

  try {
    decoded_jwt = await new Promise((resolve, reject) => {
      jsonwt.verify(jwt, rsa_pem_publicKey, {
        algorithm: 'RS256',
        maxAge: "2 days",
        // clockTolerance: (60 * 60) // 1hr of tolerance w/ 2-day expire.
      }, (error, jwt) => {
        error ? reject(error): resolve(jwt)
      });
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      invalidations.push(e.jwt_expired);
    } else {
      invalidations.push(e.jwt_invalid);
    }
  }

  if (invalidations.length > 0) {
    res.status(400).json({ errors: invalidations });
    return;
  }

  let entries;

  try {
    entries = await db.entry.getLatest100();
  } catch (error) {
    const id = `${Date.now()}-${Math.round(Math.random() * 9999) + 1000}`;
    res.status(500).json({ id, error: "internal server error" });
    console.error(id, error);
  }

  // get content for entries
  for (let entry of entries) {
    if (typeof entry.contents === 'undefined') {
      entry.contents = [];
    }

    const markdown = await db.content_markdown.getByEntryID(entry.id);

    entry.contents.push(markdown);
  }

  res.status(200).json({ entries });
};

/*
   Add a new entry.

   Entries can have multiple contents. Content types must be specified as
   a field in each content object. Order matters.

   POST body example: {
     contents: [
       { type: 'markdown', markdown: '...' },
       { type: 'markdown', markdown: '...' },
       ...
     ]
   }
*/
exports.add = (db, rsa_pem_publicKey) => async (req, res) => {
  const invalidations = [];
  const { contents } = req.body;
  const { jwt } = req.query;

  if (typeof jwt !== 'string') {
    invalidations.push(e.missing_parameter('jwt'));
  }

  if (!(contents instanceof Array)) {
    invalidations.push(e.invalid_parameter("contents", "must be an array"));
  } else {
    contents.forEach((content) => {
      if (typeof content.type === 'undefined') {
        invalidations.push(e.invalid_parameter("contents", "content missing `type` field"));
      }

      if (content.type !== 'markdown') {
        invalidations.push(e.invalid_parameter("contents", "invalid `type` field provided"));
      }

      if (typeof content.markdown !== 'string') {
        invalidations.push(e.invalid_parameter("contents", "type `markdown` must have `markdown` field"));
      }
    });
  }

  let decoded_jwt;

  try {
    decoded_jwt = await new Promise((resolve, reject) => {
      jsonwt.verify(jwt, rsa_pem_publicKey, {
        algorithm: 'RS256',
        maxAge: "2 days",
        // clockTolerance: (60 * 60) // 1hr of tolerance w/ 2-day expire.
      }, (error, jwt) => {
        error ? reject(error): resolve(jwt)
      });
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      invalidations.push(e.jwt_expired);
    } else {
      invalidations.push(e.jwt_invalid);
    }
  }

  let token;
  if (decoded_jwt) {
    token = await db.token.getByToken(decoded_jwt.token);

    if (typeof token === 'undefined') {
      invalidations.push(e.not_found("the token was not found---reauthenticate."));
    }
  }

  if (invalidations.length > 0) {
    res.status(400).json({ errors: invalidations });
    return;
  }

  try {
    const { lastID: entryID } = await db.entry.add(token.id);

    const contentIDs = [];
    for (let content of contents) {
      const { lastID: contentID } = await db.content_markdown.add(
        entryID, content.markdown
      );

      contentIDs.push(contentID)
    }

    res.status(200).json({});
  } catch (error) {
    const id = `${Date.now()}-${Math.round(Math.random() * 9999) + 1000}`;
    res.status(500).json({ id, error: "internal server error" });
    console.error(id, error);
  }
};
      console.log(contentResult);

      const contentID = contentResult.lastID;

      contentIDs.push(contentID)
    }


    res.status(200).json({});
  } catch (error) {
    const id = `${Date.now()}-${Math.round(Math.random() * 9999) + 1000}`;
    res.status(500).json({ id, error: "internal server error" });
    console.error(id, error);
  }
};
