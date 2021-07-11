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


app.get('/', function(req, res, next) {

  var context = req.context;
  createString = `
  CREATE TABLE IF NOT EXISTS Customers (
    customer_id int NOT NULL AUTO_INCREMENT,
    password varchar(255) NOT NULL,
    customer_type varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    phone char(10) DEFAULT NULL,
    is_admin tinyint(1) DEFAULT NULL,
    PRIMARY KEY (customer_id)
  );`;

  mysql.pool.query(createString, function(err, rows, fields){
      if(err){
        next(err);
    return;
      }
    })
    /*Create Table */
  mysql.pool.query('SHOW COLUMNS FROM "Customers"', function(err, rows, fields){
    /* Build table header */
  context.data = rows
  console.log(context.data)
  res.render('home',context);
  }); /* Select */
});

app.post('/',function (req,res,next) {

  if (req.body['AddRow']) {
    let iString = 'INSERT INTO "Customers" (`password`,`customer_type`,`name`,`phone`,`is_admin`) VALUES ("'+
    +'","'+req.body.password
    +'","'+req.body.customer_type
    +'","'+req.body.customer_name
    +'","'+req.body.phone
    +'","'+req.body.is_admin
    + '")';
  console.log(iString);

  mysql.pool.query(iString,function (err) {
    if(err){
      next(err)
      return
    }
  }); /* Insert Into */
  }/*end add item if*/
  res.redirect('/')
}); /*End app.Post('/') */

app.get('/products', function(req, res, next) {

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

app.get('/orders', function(req, res, next) {

  var context = req.context;
  
  // Eventually get orders for customer where not order is not cart, sorted by created_date
  // Also get each order's products, addresses, payment methods
  // convert dates to JS iso strings here
  context.orders = [
    {
      order_id: 1,
      created_date: '2021-01-05T10:15:00.000Z',
      shipped_date: '2021-01-06T15:30:00.000Z',
      total_paid: '$500.00',
      address: {
        address_id,
        address1: '123 Test Street',
        address2: 'Unit 3',
        city: 'Dallas',
        state: 'Tx',
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
          tracking_number: '1ZASDFGSGDASASD'
        }
      ]
    },
    {
      order_id: 3,
      created_date: '2021-01-08T01:10:00.000Z',
      shipped_date: '2021-01-10T05:40:00.000Z',
      total_paid: '$400.00',
      address: {
        address_id,
        address1: '246 Other Street',
        address2: '',
        city: 'New York City',
        state: 'Ny',
        zip: 11201
      },
      payment_method: {
        payment_method_id: 2,
        type: 'PayPal',
        display_info: 'Email: test@test.com'
      },
      products: [
        {
          product_id: 5,
          description: '21 Inch LCD Monitor',
          in_stock_qty: 5,
          price: '$150.00',
          tracking_number: '2ZASDFGSGDASASD'
        },
        {
          product_id: 23,
          description: 'Acoustic Guitar',
          in_stock_qty: 300,
          price: '$250.00',
          tracking_number: '3ZASDFGSGDASASD'
        }
      ]
    }
  ];

  res.render('products', context);
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
