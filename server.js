const express  = require("express");
const cors     = require("cors");
const bcrypt   = require("bcrypt");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const jwt      = require("jsonwebtoken");
const sql      = require("sqlite3").verbose();
const app = express();

const db = new sql.Database("./plusplus.db", (err) => {
   if (err) {
      throw err;
   }
   console.log("opening db connection")
   // create table if needed
   let newTable = `CREATE TABLE IF NOT EXISTS users (
               user_id INTEGER PRIMARY KEY AUTOINCREMENT,
               user_em text NOT NULL UNIQUE,
               user_pw text NOT NULL
            );`;
   db.run(newTable, [], (err) => {
      if (err) {
         throw err;
      }
   })
});

app.use(cors());

app.post("/login", jsonParser, (req, res) => {
   let user_em = req.body.em;
   let user_pw = req.body.pw;
   let params = `SELECT user_id, user_em, user_pw FROM users WHERE user_em = "${user_em}";`
   // get user from db
   db.get(params, (err, row) => {
      // db error
      if (err) {
         console.log(err.message);
         return res.json({
            msg: "login failed, try again",
            jwt: ""
         })
      }
      // user not in db
      if (!row) {
         return res.json({
            msg: `login failed. no user '${user_em}' in db. try again`,
            jwt: ""
         })
      }
      // bccrypt.compare
      bcrypt.compare(user_pw, row.user_pw, (err, same) => {
         if (err) {
            console.log(err.message);
            return res.json({
               msg: "login failed, try again",
               jwt: ""
            })
         }
         // wrong pw
         if (!same) {
            return res.json({
               msg: "login failed - incorrect password. check for typos and try again",
               jwt: ""
            })
         }
         res.json({
            msg: `logged in as '${row.user_em}'`,
            jwt: jwt.sign({ sub: `${row.user_id}` }, "secret")
         })
      })
   })
})


app.post("/signup", jsonParser, (req, res) => {
   let user_em = req.body.em;
   let user_pw = req.body.pw;
   bcrypt.hash(user_pw, 14, (err, hash_pw) => {
      let params = `INSERT INTO users (user_em, user_pw) VALUES ("${user_em}", "${hash_pw}");`
      db.run(params, (err) => {
         if (err) {
            console.log(err.message);
            return res.json({
               msg: "signup failed, try again",
               jwt: ""
            })
         }
         res.json({
            msg: "signup successful",
            jwt: jwt.sign({ sub: `${this.lastID}` }, "secret")
         })
      })
   })
})

app.listen(5000, () => console.log("Server started on port 5000"));

// process.on("exit", () => {
//    db.close((err) => {
//       if (err) {
//          throw err
//       }
//       console.log("closing db connection")
//    })
// })

