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

  if (req.originalUrl.toLowerCase().includes('create-tables')) {
    next();
    return;
  }

  // Context can be accessed from req.context in all route handlers (needed for site navbar)
  req.context = {};

  // TODO: get logged in customer id from cookie or handle no customer logged in
  const customerId = 1;

  const customerQuery = `
    SELECT customer_id, name, customer_type, is_admin
    FROM Customers
    WHERE customer_id = ?;
  `;
  const customerQueryValues = [customerId];

  mysql.pool.query(customerQuery, customerQueryValues, function (err, rows) {
    if (err) {
      next(err);
      return;
    }

    if (!rows || !rows.length) {
      console.error(`Customer with id ${customerId} not found!`);
      return;
    }

    req.context.loggedInCustomer = rows[0];

    const cartQuery = `
      SELECT Orders.order_id, SUM(Orders_products_relation.ordered_quantity) AS itemCount FROM Orders
      INNER JOIN Orders_products_relation ON Orders_products_relation.order_id = Orders.order_id
      WHERE Orders.customer_id = ? AND Orders.is_cart = true GROUP BY Orders.order_id;
    `;
    const cartQueryValues = [req.context.loggedInCustomer.customer_id];

    mysql.pool.query(cartQuery, cartQueryValues, function (err, rows) {
      if (err) {
        next(err);
        return;
      }

      if (!rows || !rows.length) {
        console.error('Customer has no cart!');
        return;
      }

      req.context.cartInfo = rows[0];
      next();
    });
  });
}

app.use(getSiteInfo);

app.get('/', function(req, res){
  var context = req.context;
  res.render('index', context)
});

//Refactor - Using Router
const ddl = require('./routes/ddl.js');
app.use(ddl);
const customers = require ('./routes/customers.js');
app.use(customers);
const payment_methods = require('./routes/payment_methods.js');
app.use(payment_methods);
const addresses = require('./routes/addresses.js');
app.use(addresses);
const emails = require('./routes/emails.js');
app.use(emails);
const products = require ('./routes/products.js');
app.use(products);
const categories = require ('./routes/categories.js');
app.use(categories);


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

const cart = require ('./routes/cart.js');
app.use(cart);

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
