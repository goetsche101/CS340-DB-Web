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
app.use('/static', express.static(path.join(__dirname, 'public')));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
context = {};

app.get('/', function(req, res, next) {
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

app.get('/other-page',function (req,res) {
  res.type('text/plain');
  res.send('Welcome to the other page!');
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
