const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'slackapp_test',
  password: process.env.DB_PASS,
  port: 5432,
});

// pool.query('INSERT INTO animals(type, weight) VALUES($1, $2)', ['horse', 400], (err, res) => {
//   if (err) {
//     console.log(err.stack);
//   } else {
//     console.log(res.rows[0]);
//     pool.end();
//   };
// });