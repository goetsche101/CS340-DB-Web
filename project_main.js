const path = require('path');
var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret:'SuperSecretPassword'}));
app.use(express.static('public'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);


// This gets run before every route handler
function getSiteInfo (req, res, next) {

  // Eventually get cart and logged in user info from DB here

  // Context can be accessed from req.context in all route handlers (needed for site navbar)
  req.context = {
    cartInfo: {
      itemCount: 2
    },
    loggedInCustomer: {
      customer_id: 1,
      name: 'Test User',
      customer_type: 'User',
      phone: '1-888-888-8888',
      is_admin: true
    }
  };

  next();
}

app.use(getSiteInfo);

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
  
  CREATE TABLE IF NOT EXISTS Orders (
    order_id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,
    address_id INT,
    payment_method_id INT,
    is_cart BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP,
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

  CREATE TABLE IF NOT EXISTS Products (
    product_id INT NOT NULL AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    in_stock_qty INT NOT NULL,
    price DECIMAL(12,2),
    PRIMARY KEY (product_id)
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

  CREATE TABLE IF NOT EXISTS Categories (
    category_id INT NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (category_id)
  );
  `
}


app.get('/create-tables', function (req, res, next) {

  mysql.pool.query('SHOW TABLES LIKE \'Customers\';', function (err, rows, fields) {
    
    if (err) {
      next(err);
      return;
    }

    if (!rows && !rows.length) {
      // If the customers table doesn't exist assume the other tables don't exist
      // either and create them
      createTables(req, res, next);
    }
  });

});


app.get('/', function(req, res){
  var context = req.context;
  context.port = process.argv[2]
  console.log(context.port)
  res.render('index', context)
});
//Refactor - Using Router
const ddl = require('./routes/ddl.js')
app.use(ddl)
const customers = require ('./routes/customers.js')
app.use(customers)



app.get('/products', function(req, res, next) {

  // TODO: implement category filter and search
  var context = req.context;

  context.products = [
    {
      product_id: 1,
      description: '21 Speed Mountain Bike',
      in_stock_qty: 50,
      price: '$500.00'
    },
    {
      product_id: 5,
      description: '21 Inch LCD Monitor',
      in_stock_qty: 5,
      price: '$150.00'
    },
    {
      product_id: 23,
      description: 'Acoustic Guitar',
      in_stock_qty: 300,
      price: '$250.00'
    }
  ];

  res.render('products', context);
});


app.get('/categories', function(req, res, next) {

  var context = req.context;
  
  context.categories = [
    {
      category_id: 1,
      category_name: 'Musical Instruments'
    },
    {
      category_id: 2,
      category_name: 'Computer Parts'
    },
    {
      category_id: 3,
      category_name: 'Sports Equiptment'
    },
  ];

  res.render('categories', context);
});

app.post('/categories/add', function (req, res, next) {

  res.redirect('/categories');
});

app.post('/categories/delete', function (req, res, next) {

  res.redirect('/categories');
});

app.get('/orders', function(req, res, next) {

  var context = req.context;

  // Eventually get orders for customer where not order is not cart, sorted by created_date
  // Also get each order's products, addresses, payment methods
  // Do any formatting on attributes here
  context.orders = [
    {
      order_id: 3,
      created_date: 'July 8 2021',
      shipped_date: 'July 10 2021',
      total_paid: '$400.00',
      address: {
        address_id: 2,
        address1: '246 Other Street',
        address2: '',
        city: 'New York City',
        state: 'NY',
        zip: 11201
      },
      payment_method: {
        payment_method_id: 2,
        type: 'PayPal',
        display_info: 'PayPal: test@test.com'
      },
      products: [
        {
          product_id: 5,
          description: '21 Inch LCD Monitor',
          in_stock_qty: 5,
          price: '$150.00',
          ordered_quantity: 1
        },
        {
          product_id: 23,
          description: 'Acoustic Guitar',
          in_stock_qty: 300,
          price: '$250.00',
          ordered_quantity: 1
        }
      ]
    },
    {
      order_id: 1,
      created_date: 'July 5 2021',
      shipped_date: 'Awaiting Shipment',
      total_paid: '$500.00',
      address: {
        address_id: 1,
        address1: '123 Test Street',
        address2: 'Unit 3',
        city: 'Dallas',
        state: 'TX',
        zip: 76123
      },
      payment_method: {
        payment_method_id: 1,
        type: 'Credit Card',
        display_info: 'Credit Card ending in 1234'
      },
      products: [
        {
          product_id: 1,
          description: '21 Speed Mountain Bike',
          in_stock_qty: 50,
          price: '$500.00',
          ordered_quantity: 1
        }
      ]
    }
  ];

  res.render('orders', context);
});

app.get('/cart', function(req, res, next) {

  var context = req.context;

  context.addresses = [
    {
      address_id: 1,
      address1: '123 Test Street',
      address2: 'Unit 3',
      city: 'Dallas',
      state: 'TX',
      zip: 76123
    },
    {
      address_id: 2,
      address1: '246 Other Street',
      address2: '',
      city: 'New York City',
      state: 'NY',
      zip: 11201
    }
  ];

  context.payment_methods = [
    {
      payment_method_id: 1,
      type: 'Credit Card',
      display_info: 'Credit Card ending in 1234'
    },
    {
      payment_method_id: 2,
      type: 'PayPal',
      display_info: 'PayPal: test@test.com'
    }
  ]

  context.cart = {
    order_id: 3,
    total_cost: '$400.00',
    address_id: 2,
    payment_method_id: 2,
    products: [
      {
        product_id: 5,
        description: '21 Inch LCD Monitor',
        in_stock_qty: 5,
        price: '$150.00',
        ordered_quantity: 1
      },
      {
        product_id: 23,
        description: 'Acoustic Guitar',
        in_stock_qty: 300,
        price: '$250.00',
        ordered_quantity: 1
      }
    ]
  };

  res.render('cart', context);
});

app.post('/cart/add', function (req, res, next) {

  res.redirect('/cart');
});

app.post('/cart/change_quantity', function (req, res, next) {

  res.redirect('/cart');
});

app.use(function (req, res) {

  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function (err, req, res, next) {

  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function () {

  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
