const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

dotenv.config();

const app = express();
const port = 3000;

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/api/products', (req, res) => {
  const sql = 'SELECT * FROM Product';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Add Inventory
app.post('/api/products', (req, res) => {
  const { productName, description, price, category, quantity, reorderLevel } = req.body;
  const sql = 'INSERT INTO Product (productName, description, price, category, quantity, reorderLevel, createdDate, updatedDate) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
  db.query(sql, [productName, description, price, category, quantity, reorderLevel], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId, ...req.body });
  });
});

// Delete Inventory
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM Product WHERE productID = ?';
  db.query(sql, [productId], (err, result) => {
      if (err) throw err;
      res.json({ message: 'Product deleted successfully' });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM User WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.send('Internal server error');
    }
    if (results.length > 0) {
      const user = results[0];
      console.log('User found:', user);
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Bcrypt comparison error:', err);
          return res.send('Internal server error');
        }
        if (isMatch) {
          req.session.userId = user.userID;
          return res.redirect('/dashboard');
        } else {
          console.log('Password does not match');
          return res.send('Incorrect username or password');
        }
      });
    } else {
      console.log('No user found with this username');
      return res.send('Incorrect username or password');
    }
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) throw err;
    res.redirect('/login.html');
  });
});

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
