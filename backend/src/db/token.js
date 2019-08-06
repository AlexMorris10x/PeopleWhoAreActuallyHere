exports.create = (sqlite3_db) => new Promise((resolve, reject) =>
  sqlite3_db.run(`CREATE TABLE IF NOT EXISTS token (
     id INTEGER PRIMARY KEY,
     value TEXT NOT NULL UNIQUE,
     created_utc INTEGER NOT NULL
   );`, [], function(error) { // must use function as `this` is utilized in lib-sqlite3
     return error ? reject(error) : resolve(this);
   }));

exports.add = (sqlite3_db, token_value) => new Promise((resolve, reject) => {
  const now_utc = new Date().getTime();
  const sql = `INSERT INTO token (value, created_utc) VALUES (?, ?);`;
  const params = [ token_value, now_utc ];
  sqlite3_db.run(sql, params, function(error) {
    return error ? reject(error) : resolve(this);
  });
});

exports.getByToken = (sqlite3_db, token_value) => new Promise((resolve, reject) =>
  sqlite3_db.get(`SELECT * FROM token WHERE value=?;`, [
    token_value
  ], function(error, result) {
    return error ? reject(error) : resolve(result);
  }));

exports.upsert = async (sqlite3_db, token_value) => {
  const dbJWT = await exports.getByToken(sqlite3_db, token_value);

  if (typeof dbJWT === 'undefined') {
    return await exports.add(sqlite3_db, token_value);
  }
}
