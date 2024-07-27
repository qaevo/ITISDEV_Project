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
