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
      SELECT Orders.order_id, SUM(Orders_products_relation.ordered_quantity) AS itemCount
      FROM Orders
      LEFT OUTER JOIN Orders_products_relation
        ON Orders_products_relation.order_id = Orders.order_id
      WHERE Orders.customer_id = ? AND Orders.is_cart = true
      GROUP BY Orders.order_id;
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
      // Fix for blank cart item count when no products are in cart
      req.context.cartInfo.itemCount = req.context.cartInfo.itemCount || 0;
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

const orders = require ('./routes/orders.js');
app.use(orders);

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
