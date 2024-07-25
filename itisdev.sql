-- Create the database
CREATE DATABASE IF NOT EXISTS ITISDEV;

-- Use the database
USE ITISDEV;

-- Create User table
CREATE TABLE User (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45) NOT NULL,
    password VARCHAR(200) NOT NULL,
    firstName VARCHAR(45),
    lastName VARCHAR(45),
    role VARCHAR(45),
    hireDate DATE
);


-- Create Product table
CREATE TABLE Product (
    productID INT AUTO_INCREMENT PRIMARY KEY,
    productName VARCHAR(45) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    category VARCHAR(45),
    quantity FLOAT NOT NULL,
    reorderLevel FLOAT NOT NULL,
    createdDate DATETIME,
    updatedDate DATETIME
);

-- Create Supplier table
CREATE TABLE Supplier (
    supplierID INT AUTO_INCREMENT PRIMARY KEY,
    supplierName VARCHAR(100) NOT NULL,
    contactName VARCHAR(100),
    contactEmail VARCHAR(100),
    contactPhone VARCHAR(45),
    address TEXT,
    city VARCHAR(45),
    postalCode VARCHAR(10),
    country VARCHAR(45)
);

-- Create PurchaseOrder table
CREATE TABLE PurchaseOrder (
    purchaseOrderID INT AUTO_INCREMENT PRIMARY KEY,
    supplierID INT,
    userID INT,
    orderDate DATETIME,
    status VARCHAR(45),
    totalAmount FLOAT,
    FOREIGN KEY (supplierID) REFERENCES Supplier(supplierID),
    FOREIGN KEY (userID) REFERENCES User(userID)
);

-- Create PurchaseOrderItem table
CREATE TABLE PurchaseOrderItem (
    itemID INT AUTO_INCREMENT PRIMARY KEY,
    purchaseOrderID INT,
    productID INT,
    quantity FLOAT NOT NULL,
    unitPrice FLOAT NOT NULL,
    totalPrice FLOAT NOT NULL,
    FOREIGN KEY (purchaseOrderID) REFERENCES PurchaseOrder(purchaseOrderID),
    FOREIGN KEY (productID) REFERENCES Product(productID)
);

-- Create Customer table
CREATE TABLE Customer (
    customerID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(45),
    lastName VARCHAR(45),
    email VARCHAR(100),
    phone VARCHAR(45),
    address TEXT,
    city VARCHAR(45),
    postalCode VARCHAR(10),
    country VARCHAR(45)
);

-- Create Order table
CREATE TABLE `Order` (
    orderID INT AUTO_INCREMENT PRIMARY KEY,
    customerID INT,
    userID INT,
    orderDate DATETIME,
    totalAmount FLOAT,
    status VARCHAR(45),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (userID) REFERENCES User(userID)
);

-- Create OrderItem table
CREATE TABLE OrderItem (
    itemID INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT,
    productID INT,
    quantity FLOAT NOT NULL,
    unitPrice FLOAT NOT NULL,
    totalPrice FLOAT NOT NULL,
    FOREIGN KEY (orderID) REFERENCES `Order`(orderID),
    FOREIGN KEY (productID) REFERENCES Product(productID)
);

-- Create InventoryTransaction table
CREATE TABLE InventoryTransaction (
    transactionID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT,
    transactionType ENUM('IN', 'OUT') NOT NULL,
    quantity FLOAT NOT NULL,
    transactionDate DATETIME,
    userID INT,
    FOREIGN KEY (productID) REFERENCES Product(productID),
    FOREIGN KEY (userID) REFERENCES User(userID)
);

-- Use the database
USE ITISDEV;

-- Insert sample users
INSERT INTO User (username, password, firstName, lastName, role, hireDate) VALUES
('admin', '$2b$10$K8Q8wqI8vFwUG1e9HevFQOFSb/jj5GbOohOCGStYPW6OVQ5aPmD4O', 'John', 'Doe', 'admin', '2022-01-01'), -- password: admin
('user', '$2b$10$D1ISOSJxOdvElJlIroV5Mue9M.MvHyyu8LP9G/UZcyov5IgqWZUAu', 'Jane', 'Smith', 'user', '2022-02-01'); -- password: user

-- Insert sample products
INSERT INTO Product (productName, description, price, category, quantity, reorderLevel, createdDate, updatedDate) VALUES
('Laptop', 'High-performance laptop', 1200.0, 'Electronics', 50.0, 10.0, NOW(), NOW()),
('Smartphone', 'Latest model smartphone', 800.0, 'Electronics', 100.0, 20.0, NOW(), NOW()),
('Headphones', 'Noise-cancelling headphones', 150.0, 'Accessories', 200.0, 30.0, NOW(), NOW());

-- Insert sample suppliers
INSERT INTO Supplier (supplierName, contactName, contactEmail, contactPhone, address, city, postalCode, country) VALUES
('Tech Supplies Inc.', 'John Doe', 'john@techsupplies.com', '123-456-7890', '123 Tech Street', 'Tech City', '12345', 'Techland'),
('Gadget World', 'Jane Smith', 'jane@gadgetworld.com', '987-654-3210', '456 Gadget Avenue', 'Gadget City', '67890', 'Gadgetland');

-- Insert sample customers
INSERT INTO Customer (firstName, lastName, email, phone, address, city, postalCode, country) VALUES
('Alice', 'Johnson', 'alice@example.com', '111-222-3333', '123 Maple Street', 'Maple City', '54321', 'Mapleland'),
('Bob', 'Brown', 'bob@example.com', '444-555-6666', '456 Oak Avenue', 'Oak City', '98765', 'Oakland');

-- Insert sample purchase orders
INSERT INTO PurchaseOrder (supplierID, userID, orderDate, status, totalAmount) VALUES
(1, 1, NOW(), 'Completed', 12000.0),
(2, 2, NOW(), 'Pending', 8000.0);

-- Insert sample purchase order items
INSERT INTO PurchaseOrderItem (purchaseOrderID, productID, quantity, unitPrice, totalPrice) VALUES
(1, 1, 10.0, 1200.0, 12000.0),
(2, 2, 10.0, 800.0, 8000.0);

-- Insert sample orders
INSERT INTO `Order` (customerID, userID, orderDate, totalAmount, status) VALUES
(1, 1, NOW(), 1350.0, 'Completed'),
(2, 2, NOW(), 150.0, 'Pending');

-- Insert sample order items
INSERT INTO OrderItem (orderID, productID, quantity, unitPrice, totalPrice) VALUES
(1, 1, 1.0, 1200.0, 1200.0),
(1, 3, 1.0, 150.0, 150.0),
(2, 3, 1.0, 150.0, 150.0);

-- Insert sample inventory transactions
INSERT INTO InventoryTransaction (productID, transactionType, quantity, transactionDate, userID) VALUES
(1, 'IN', 10.0, NOW(), 1),
(2, 'IN', 20.0, NOW(), 2),
(3, 'IN', 30.0, NOW(), 3),
(1, 'OUT', 1.0, NOW(), 1),
(3, 'OUT', 2.0, NOW(), 2);
