const jsonwt = require('jsonwebtoken');
const e = require('../error_codes');

module.exports = (db, tokenGen, tokenKey, rsa_pem_privateKey) => async (req, res) => {
  const invalidations = [];
  const { token } = req.body;

  if (typeof token !== 'string') {
    invalidations.push(e.missing_parameter('token'));
  } else {
    const cachedTokens = tokenGen.getTokens(tokenKey);

    if (typeof cachedTokens === 'undefined') {
      invalidations.push(e.token_not_cached);
    } else if (!cachedTokens.includes(token)) {
      invalidations.push(e.token_invalid_or_expired);
    }
  }

  if (invalidations.length > 0) {
    res.status(400).json({ errors: invalidations });
    return;
  }

  let upsertResult;
  try {
    upsertResult = await db.token.upsert(token);
  } catch(error) {
    const id = `${Date.now()}-${Math.round(Math.random() * 9999) + 1000}`;
    res.status(500).json({ id, error: "internal server error" });
    console.error(id, error);
  }

  const jwt = await new Promise((resolve, reject) =>
    jsonwt.sign({ token }, rsa_pem_privateKey, {
      algorithm: 'RS256',
      expiresIn: "2 days"
    }, (error, jwt) => {
      error ? reject(error) : resolve(jwt)
    }));

  res.status(200).json({ jwt, token_id: upsertResult.lastID });
};
