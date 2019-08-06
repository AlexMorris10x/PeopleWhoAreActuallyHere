exports.create = (sqlite3_db) => new Promise((resolve, reject) =>
  sqlite3_db.run(`CREATE TABLE IF NOT EXISTS entry (
     id INTEGER PRIMARY KEY,
     token_id TEXT NOT NULL,
     created_utc INTEGER NOT NULL,
     FOREIGN KEY(token_id) REFERENCES token(id)
   );`, [], function(error) { // must use function as `this` is utilized in lib-sqlite3
     return error ? reject(error) : resolve(this);
   }));

exports.getByID = (sqlite3_db, entry_id) => new Promise((resolve, reject) =>
  sqlite3_db.get(`SELECT * FROM entry WHERE id=?;`, [
    entry_id
  ], function(error, result) {
    return error ? reject(error) : resolve(result);
  }));

exports.add = (sqlite3_db, token_id) => new Promise((resolve, reject) => {
  const now_utc = new Date().getTime();

  const params = [ token_id, now_utc ];

  const sql = `INSERT INTO entry (
    token_id, created_utc
  ) VALUES (?, ?)`;

  sqlite3_db.run(sql, params, function(error) {
    return error ? reject(error) : resolve(this);
  });
});

exports.getLatest100 = (sqlite3_db) => new Promise((resolve, reject) =>
  sqlite3_db.all('SELECT * FROM entry ORDER BY created_utc DESC LIMIT 100', [], function(error, rows) {
    return error ? reject(error) : resolve(rows)
  }));
