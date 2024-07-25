const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
