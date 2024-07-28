const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { body, validationResult } = require("express-validator");

dotenv.config();

const app = express();
const port = 3000;

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL Connected...");
});

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/api/products", (req, res) => {
  const sql = "SELECT * FROM Product";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Add Inventory
app.post("/api/products", (req, res) => {
  const { productName, description, price, category, quantity, reorderLevel } =
    req.body;
  const sql =
    "INSERT INTO Product (productName, description, price, category, quantity, reorderLevel, createdDate, updatedDate) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
  db.query(
    sql,
    [productName, description, price, category, quantity, reorderLevel],
    (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

// Delete Inventory
app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const sql = "DELETE FROM Product WHERE productID = ?";
  db.query(sql, [productId], (err, result) => {
    if (err) throw err;
    res.json({ message: "Product deleted successfully" });
  });
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const sql = "SELECT * FROM User WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {
      const user = results[0];

      // Log the stored hashed password and the provided password
      // console.log("User found:", user);
      // console.log("Stored hashed password:", user.password);
      // console.log("Password to compare:", password);

      // Debugging
      bcrypt.compare(password, user.password, (err, isMatch) => {
        console.log("Password match result:", isMatch);
      });

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("Bcrypt comparison error:", err.message);

          return res.status(500).json({ error: "Internal server error" });
        }
        if (isMatch) {
          req.session.userId = user.userID;
          console.log("Password match successful.");

          return res.json({ success: true });
        } else {
          console.log("Password does not match");

          return res
            .status(401)
            .json({ error: "Incorrect username or password" });
        }
      });
    } else {
      console.log("No user found with this username");
      return res.status(401).json({ error: "Incorrect username or password" });
    }
  });
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    } else {
      res.status(200).send("Logged out");
    }
  });
});


//Edit inventory
// API endpoint to get a product by ID
app.get('/api/products/:id', (req, res) => {
  const productID = parseInt(req.params.id, 10);
  const product = products.find(p => p.productID === productID);

  if (product) {
      res.json(product);
  } else {
      res.status(404).json({ message: 'Product not found' });
  }
});

// API endpoint to update a product by ID
app.put('/api/products/:id', (req, res) => {
  const productID = parseInt(req.params.id, 10);
  const productIndex = products.findIndex(p => p.productID === productID);

  if (productIndex !== -1) {
      const updatedProduct = {
          productID: productID,
          ...req.body
      };
      products[productIndex] = updatedProduct;
      res.json(updatedProduct);
  } else {
      res.status(404).json({ message: 'Product not found' });
  }
});

// Dashboard route (protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Other routes and middleware
// Fetch inventory summary
app.get('/api/getInventorySummary', (req, res) => {
  const query = 'SELECT * FROM Product';
  db.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching inventory summary: ', error);
          res.status(500).send(error);
      } else {
          res.json(results);
      }
  });
});

// Fetch inventory transactions
app.get('/api/getInventoryTransactions', (req, res) => {
  const query = `
      SELECT 
          it.transactionID, it.transactionType, it.quantity, it.transactionDate, 
          p.productID, p.productName, u.userID, u.username
      FROM 
          InventoryTransaction it
      JOIN 
          Product p ON it.productID = p.productID
      JOIN 
          User u ON it.userID = u.userID
  `;
  db.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching inventory transactions: ', error);
          res.status(500).send(error);
      } else {
          res.json(results);
      }
  });
});

// Fetch supplier information
app.get('/api/getSupplierInfo', (req, res) => {
  const query = 'SELECT * FROM Supplier';
  db.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching supplier info: ', error);
          res.status(500).send(error);
      } else {
          res.json(results);
      }
  });
});

// Fetch purchase orders
app.get('/api/getPurchaseOrders', (req, res) => {
  const query = `
      SELECT 
          po.purchaseOrderID, po.orderDate, po.status, po.totalAmount,
          s.supplierID, s.supplierName, u.userID, u.username
      FROM 
          PurchaseOrder po
      JOIN 
          Supplier s ON po.supplierID = s.supplierID
      JOIN 
          User u ON po.userID = u.userID
  `;
  db.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching purchase orders: ', error);
          res.status(500).send(error);
      } else {
          res.json(results);
      }
  });
});

// Fetch sales orders
app.get('/api/getSalesOrders', (req, res) => {
  const query = `
      SELECT 
          o.orderID, o.orderDate, o.status, o.totalAmount,
          c.customerID, c.firstName, c.lastName, u.userID, u.username
      FROM 
          \`Order\` o
      JOIN 
          Customer c ON o.customerID = c.customerID
      JOIN 
          User u ON o.userID = u.userID
  `;
  db.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching sales orders: ', error);
          res.status(500).send(error);
      } else {
          res.json(results);
      }
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM User', (err, results) => {
      if (err) {
          console.error('Error fetching users:', err);
          res.status(500).json({ error: 'Error fetching users' });
      } else {
          res.json(results);
      }
  });
});

// Get a single user
app.get('/api/getUser/:id', (req, res) => {
  const query = 'SELECT * FROM User WHERE userID = ?';
  db.query(query, [req.params.id], (err, results) => {
      if (err) throw err;
      res.json(results[0]);
  });
});

// Add a new user
app.post('/api/addUser', (req, res) => {
  const { username, password, firstName, lastName, role, hireDate } = req.body;
  const query = 'INSERT INTO User (username, password, firstName, lastName, role, hireDate) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [username, password, firstName, lastName, role, hireDate], (err, results) => {
      if (err) throw err;
      res.json({ success: true });
  });
});

// Edit a user
app.post('/api/addEditUser', (req, res) => {
  const { userID, username, password, firstName, lastName, role, hireDate } = req.body;
  const query = userID ? 'UPDATE User SET username = ?, password = ?, firstName = ?, lastName = ?, role = ?, hireDate = ? WHERE userID = ?' : 'INSERT INTO User (username, password, firstName, lastName, role, hireDate) VALUES (?, ?, ?, ?, ?, ?)';
  const values = userID ? [username, password, firstName, lastName, role, hireDate, userID] : [username, password, firstName, lastName, role, hireDate];

  db.query(query, values, (err, results) => {
      if (err) {
          console.error('Error adding/editing user:', err);
          res.status(500).json({ error: 'Error adding/editing user' });
      } else {
          res.json({ success: true });
      }
  });
});


// Delete a user
app.delete('/api/deleteUser/:id', (req, res) => {
  const userID = req.params.id;

  db.query('DELETE FROM `Order` WHERE userID = ?', [userID], (err, results) => {
      if (err) {
          console.error('Error deleting orders:', err);
          res.status(500).json({ error: 'Error deleting orders' });
      } else {
          db.query('DELETE FROM User WHERE userID = ?', [userID], (err, results) => {
              if (err) {
                  console.error('Error deleting user:', err);
                  res.status(500).json({ error: 'Error deleting user' });
              } else {
                  res.json({ success: true });
              }
          });
      }
  });
});
// Get all orders
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM `Order`', (err, results) => {
      if (err) {
          console.error('Error fetching orders:', err);
          res.status(500).json({ error: 'Error fetching orders' });
      } else {
          res.json(results);
      }
  });
});


// Get a single order
app.post('/api/addEditOrder', (req, res) => {
  const { orderID, customerID, userID, orderDate, totalAmount, status } = req.body;
  const query = orderID ? 'UPDATE `Order` SET customerID = ?, userID = ?, orderDate = ?, totalAmount = ?, status = ? WHERE orderID = ?' : 'INSERT INTO `Order` (customerID, userID, orderDate, totalAmount, status) VALUES (?, ?, ?, ?, ?)';
  const values = orderID ? [customerID, userID, orderDate, totalAmount, status, orderID] : [customerID, userID, orderDate, totalAmount, status];

  db.query(query, values, (err, results) => {
      if (err) {
          console.error('Error adding/editing order:', err);
          res.status(500).json({ error: 'Error adding/editing order' });
      } else {
          res.json({ success: true });
      }
  });
});


/* Add a new order
app.post('/api/addOrder', (req, res) => {
  const { customerID, userID, orderDate, totalAmount, status } = req.body;
  const query = 'INSERT INTO `Order` (customerID, userID, orderDate, totalAmount, status) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [customerID, userID, orderDate, totalAmount, status], (err, results) => {
      if (err) throw err;
      res.json({ success: true });
  });
});*/

// Edit an order
app.delete('/api/deleteOrder/:id', (req, res) => {
  const orderID = req.params.id;

  db.query('DELETE FROM OrderItem WHERE orderID = ?', [orderID], (err, results) => {
      if (err) {
          console.error('Error deleting order items:', err);
          res.status(500).json({ error: 'Error deleting order items' });
      } else {
          db.query('DELETE FROM `Order` WHERE orderID = ?', [orderID], (err, results) => {
              if (err) {
                  console.error('Error deleting order:', err);
                  res.status(500).json({ error: 'Error deleting order' });
              } else {
                  res.json({ success: true });
              }
          });
      }
  });
});

// Delete an order
app.delete('/api/deleteUser/:id', (req, res) => {
  const userID = req.params.id;
  
  // Delete related inventory transactions first
  db.query('DELETE FROM InventoryTransaction WHERE userID = ?', [userID], (err, results) => {
      if (err) {
          console.error('Error deleting inventory transactions:', err);
          res.status(500).json({ error: 'Error deleting inventory transactions' });
      } else {
          // Delete the user
          db.query('DELETE FROM User WHERE userID = ?', [userID], (err, results) => {
              if (err) {
                  console.error('Error deleting user:', err);
                  res.status(500).json({ error: 'Error deleting user' });
              } else {
                  res.json({ success: true });
              }
          });
      }
  });
});


// Endpoint to get the username
app.get("/api/getUsername", (req, res) => {
  if (req.session && req.session.userId) {
    const sql = "SELECT username FROM User WHERE userID = ?";
    db.query(sql, [req.session.userId], (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching username");
      }
      if (results.length > 0) {
        res.json({ username: results[0].username });
      } else {
        res.status(404).send("User not found");
      }
    });
  } else {
    res.status(401).send("Unauthorized");
  }
});
