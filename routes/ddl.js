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
  CREATE TABLE IF NOT EXISTS CUSTOMERS (
      customer_id int NOT NULL AUTO_INCREMENT,
      password varchar(255) NOT NULL,
      customer_type varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      phone char(10) DEFAULT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (customer_id)
    );

    CREATE TABLE IF NOT EXISTS PRODUCTS (
      product_id INT NOT NULL AUTO_INCREMENT,
      description VARCHAR(255) NOT NULL,
      in_stock_qty INT NOT NULL,
      price DECIMAL(12,2),
      PRIMARY KEY (product_id)
    );

    CREATE TABLE IF NOT EXISTS CATEGORIES (
      category_id INT NOT NULL AUTO_INCREMENT,
      category_name VARCHAR(255) NOT NULL,
      PRIMARY KEY (category_id)
    );

    CREATE TABLE IF NOT EXISTS ADDRESSES(
      address_id INT NOT NULL AUTO_INCREMENT,
      customer_id INT NOT NULL,
      address_1 VARCHAR(255) NOT NULL,
      address_2 VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      state CHAR(2),
      zip INT(5) NOT NULL,
      PRIMARY KEY (address_id),
      FOREIGN KEY (customer_id)
          REFERENCES CUSTOMERS(customer_id)
          ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS PAYMENT_METHODS(
      payment_method_id INT NOT NULL AUTO_INCREMENT,
      customer_id INT NOT NULL,
      type INT,
      credit_card_number VARCHAR(19),
      PRIMARY KEY (payment_method_id),
      FOREIGN KEY (customer_id)
          REFERENCES CUSTOMERS(customer_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ORDERS (
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

    CREATE TABLE IF NOT EXISTS ORDERS_PRODUCTS_RELATION (
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

    `
    console.log(createString)
  mysql.pool.query(createString, function(err, rows, fields){
      if(err){
        next(err);
    return;
      }
    })
    res.end()
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
