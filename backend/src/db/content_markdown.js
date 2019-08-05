exports.create = (sqlite3_db) => new Promise((resolve, reject) =>
  sqlite3_db.run(`CREATE TABLE IF NOT EXISTS content_markdown (
     id INTEGER PRIMARY KEY,
     entry_id INTEGER,
     edited_utc INTEGER,
     markdown TEXT NOT NULL,
     FOREIGN KEY(entry_id) REFERENCES entry(id)
   );`, [], function(error) { // must use function as `this` is utilized in lib-sqlite3
     return error ? reject(error) : resolve(this);
   }));

exports.add = (sqlite3_db, entry_id, markdown) => new Promise((resolve, reject) => {

  const sql = `INSERT INTO content_markdown (
    entry_id, markdown
  ) VALUES (?, ?);`;

  const params = [ entry_id, markdown ];

  sqlite3_db.run(sql, params, function(error) {
    return error ? reject(error) : resolve(this);
  });
});

exports.getByEntryID = (sqlite3_db, entry_id) => new Promise((resolve, reject) =>
  sqlite3_db.get(`SELECT * FROM content_markdown WHERE entry_id=?;`, [
    entry_id
  ], function(error, result) {
    return error ? reject(error) : resolve(result);
  }));
