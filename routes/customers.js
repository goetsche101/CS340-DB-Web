const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/customers', function(req, res, next) {
  var context = req.context
  /* Select */
  mysql.pool.query('SELECT * FROM Customers', function(err, rows, fields){
    context.data_rows = rows
    if(err){
      next(err)
      return
    }
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM Customers WHERE FIELD != \'customer_id\'', function(err, rows, fields){
    context.column_list = rows
    if(err){
      next(err)
      return
    }
    res.render('customers', context)
    });
  });
});

router.post('/customers',function (req,res,next) {

  // Clean up data sent by the front end
  if (!req.body.is_admin) {
    req.body.is_admin = 0;
  }

  if (!req.body.customer_type) {
    req.body.customer_type = 'customer';
  }

  if (typeof req.body.phone === 'string') {
    req.body.phone = req.body.phone.replace(/[^0-9]/g, '');
  }

  if (req.body['AddRow']) {
        let iString = 'INSERT INTO Customers (`password`,`customer_type`,`name`,`phone`,`is_admin`) VALUES ("'
        +req.body.password
        +'","'+req.body.customer_type
        +'","'+req.body.name
        +'","'+req.body.phone
        +'","'+req.body.is_admin
        + '")';
      mysql.pool.query(iString,function (err, result) {
        if(err){
          next(err)
          return
        }

        // Create a cart for the new customer and an email address if specified
        let additionalEntriesQuery = `
          INSERT INTO Orders (customer_id, address_id, payment_method_id, is_cart, created_date, shipped_date, total_paid)
          VALUES (?, NULL, NULL, true, ?, NULL, NULL);
        `;
        const additionalEntriesValues = [result.insertId, new Date()];

        if (req.body.email_address) {
          additionalEntriesQuery += `
            INSERT INTO Emails (customer_id, email_address, is_primary)
            VALUES (?, ?, true);
        `;

        additionalEntriesValues.push(result.insertId);
        additionalEntriesValues.push(req.body.email_address.toLowerCase().trim());
        }

        console.log(req.body, additionalEntriesQuery);

        mysql.pool.query(additionalEntriesQuery, additionalEntriesValues, function (err) {
          if(err){
            next(err);
            return;
          }

          if (req.body.isRegisteringNewCustomer) {
            res.cookie('loggedInCustomerId', result.insertId);
            res.redirect('/');
            return;
          }


          res.redirect('/customers');
        });
      }); /* Insert Into */
  }else if (req.body['DeleteRow']){
    // Don't let the admin user be deleted
    if (req.body.customer_id === 1 || req.body.customer_id === '1') {
      res.redirect('/customers');
      return;
    }
      mysql.pool.query('DELETE FROM Customers WHERE customer_id =' + req.body.customer_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/


        res.redirect('/customers');
      })/*end mysql.query*/
  }else if(req.body['EditRow']){
    console.log(req.body['EditRow'])
          let uString = 'UPDATE Customers SET password ="'+req.body.password
          +'",customer_type="'+ req.body.customer_type
          +'",name="'+ req.body.name
          +'",phone="'+ req.body.phone
          +'",is_admin="'+ req.body.is_admin
          +'"WHERE customer_id = ' + req.body.customer_id
        console.log(uString)
        mysql.pool.query(uString, function(err){
          if(err){
            next(err)
            return
          }


          res.redirect('/customers');
        }
      )
  }/*end add item if*/
}); /*End app.Post('/') */


router.post('/login', function (req, res, next) {

  if (req.body.email_address) {
    req.body.email_address = req.body.email_address.toLowerCase().trim();
  }

  const customerQuery = `
    SELECT Emails.*, Customers.* FROM Emails
    INNER JOIN Customers ON Customers.customer_id = Emails.customer_id
    WHERE Emails.email_address = ? AND Customers.password = ?;
  `;
  const customerValues = [req.body.email_address, req.body.password];

  mysql.pool.query(customerQuery, customerValues, function (err, customer) {

    if (err) {
      next(err);
      return;
    }

    if (customer.length) {
      res.cookie('loggedInCustomerId', customer[0].customer_id);
    }

    res.redirect('/');
  });
});

router.get('/logout', function (req, res, next) {

  res.clearCookie('loggedInCustomerId');
  res.redirect('/');
});
