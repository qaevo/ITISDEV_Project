const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('MySQL Connected...');

  const users = [
    { username: 'admin', password: 'admin', firstName: 'John', lastName: 'Doe', role: 'admin', hireDate: '2022-01-01' },
    { username: 'user', password: 'user', firstName: 'Jane', lastName: 'Smith', role: 'user', hireDate: '2022-02-01' }
  ];

  const insertUser = (user) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return reject(err);
        console.log(`Hashed password for ${user.username}:`, hash);

        const sql = 'INSERT INTO User (username, password, firstName, lastName, role, hireDate) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [user.username, hash, user.firstName, user.lastName, user.role, user.hireDate];

        db.query(sql, values, (err, result) => {
          if (err) return reject(err);
          console.log('User inserted:', result.insertId);
          resolve();
        });
      });
    });
  };

  Promise.all(users.map(insertUser))
    .then(() => {
      console.log('All users inserted');
      db.end();
    })
    .catch((err) => {
      console.error('Error inserting users:', err);
      db.end();
    });
});
