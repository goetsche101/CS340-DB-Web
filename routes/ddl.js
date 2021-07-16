const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
router.get('/messages',(req, res)=> {
  console.log("testing")
  res.end()
})

module.exports = router

function createTables (req, res, next) {

  var createString = `
  CREATE TABLE IF NOT EXISTS Customers (
      customer_id int NOT NULL AUTO_INCREMENT,
      password varchar(255) NOT NULL,
      customer_type varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      phone char(10) DEFAULT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (customer_id)
    );

  CREATE TABLE IF NOT EXISTS Products (
    product_id INT NOT NULL AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    in_stock_qty INT NOT NULL,
    price DECIMAL(12,2),
    PRIMARY KEY (product_id)
  );

  CREATE TABLE IF NOT EXISTS Categories (
    category_id INT NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (category_id)
  );

  CREATE TABLE IF NOT EXISTS Products_categories_relation (
    category_id INT NOT NULL,
    product_id INT NOT NULL,
    ordered_quantity INT NOT NULL,
    FOREIGN KEY (category_id)
        REFERENCES Categories(category_id)
        ON DELETE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES Products(product_id)
        ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Addresses(
    address_id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,
    address_1 VARCHAR(255) NOT NULL,
    address_2 VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state CHAR(2),
    zip INT(5) NOT NULL,
    PRIMARY KEY (address_id),
    FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id)
        ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Emails(
    email_id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (email_id),
    FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id)
        ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Payment_methods(
    payment_method_id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,
    type INT,
    credit_card_number VARCHAR(19),
    PRIMARY KEY (payment_method_id),
    FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id)
        ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Orders (
    order_id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,
    address_id INT,
    payment_method_id INT,
    is_cart BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP NULL DEFAULT NULL,
    total_paid DECIMAL(12,2),
    PRIMARY KEY (order_id),
    FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id)
        ON DELETE CASCADE,
    FOREIGN KEY (address_id)
      REFERENCES Addresses(address_id)
      ON DELETE SET NULL,
    FOREIGN KEY (payment_method_id)
      REFERENCES Payment_methods(payment_method_id)
      ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS Orders_products_relation (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    ordered_quantity INT NOT NULL,
    FOREIGN KEY (order_id)
        REFERENCES Orders(order_id)
        ON DELETE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES Products(product_id)
        ON DELETE CASCADE
  );
  `;

  mysql.pool.query(createString, function(err, rows, fields) {

    if (err) {
      next(err);
      return;
    }

      const populateTablesString = `
        INSERT INTO Customers (password, customer_type, name, phone, is_admin)
        VALUES ('password', 'employee', 'Admin', '8888888888', TRUE);

        INSERT INTO Customers (password, customer_type, name, phone, is_admin)
        VALUES ('password', 'employee', 'Some One', '1234567890', FALSE);

        INSERT INTO Customers (password, customer_type, name, phone, is_admin)
        VALUES ('password', 'customer', 'Example Customer', '8888888888', FALSE);


        INSERT INTO Products (description, in_stock_qty, price)
        VALUES ('21 Speed Mountain Bike', 50, 500.00);

        INSERT INTO Products (description, in_stock_qty, price)
        VALUES ('21 Inch LCD Monitor', 5, 150.00);

        INSERT INTO Products (description, in_stock_qty, price)
        VALUES ('Acoustic Guitar', 300, 250.00);


        INSERT INTO Categories (category_name)
        VALUES ('Musical Instruments');

        INSERT INTO Categories (category_name)
        VALUES ('Computer Parts');

        INSERT INTO Categories (category_name)
        VALUES ('Sports Equiptment');
      `;

      mysql.pool.query(populateTablesString, function(err, rows, fields) {
        if (err) {
          next(err);
          return;
        }
    });

    res.end();
});
}


router.get('/create-tables', function (req, res, next) {
  mysql.pool.query('SHOW TABLES LIKE \'Customers\';', function (err, rows, fields) {
    console.log(rows)
    if (err) {
      next(err);
      return;
    }

    if (Object.keys(rows).length ===0) {
      // If the customers table doesn't exist assume the other tables don't exist
      // either and create them
      createTables(req, res, next);
    }

    res.end()
  });

});
