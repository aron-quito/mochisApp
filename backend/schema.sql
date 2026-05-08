CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin (password: admin123)
-- MD5 or standard BCRYPT, we'll use BCRYPT generated from PHP but for simplicity in SQL let's insert a known bcrypt hash.
-- Hash for 'admin123' is $2y$12$FvINSni/KUPWX7qPNB4nPeBORAD.bZB6oDUuQe4F0g1BrWPV7LVlW
INSERT INTO admins (username, password_hash) VALUES ('admin', '$2y$12$FvINSni/KUPWX7qPNB4nPeBORAD.bZB6oDUuQe4F0g1BrWPV7LVlW');

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    sizes JSON,
    material VARCHAR(100),
    sellingPrice DECIMAL(10, 2) NOT NULL,
    imageUrl TEXT,
    location VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lots (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    remainingStock INT NOT NULL,
    totalCost DECIMAL(10, 2) NOT NULL,
    importDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    lot_id VARCHAR(50),
    sku VARCHAR(100),
    productName VARCHAR(255),
    quantity INT NOT NULL,
    unitPrice DECIMAL(10, 2) NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_logs (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(255),
  event_type ENUM('import','stock_withdrawal','product_edit') NOT NULL,
  quantity_delta INT DEFAULT 0,
  notes TEXT,
  old_data JSON,
  new_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at DESC)
);

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  birthDate DATE,
  address TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  session_token VARCHAR(255) DEFAULT NULL,
  active TINYINT(1) DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sales ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) DEFAULT NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255) DEFAULT 'Admin';
