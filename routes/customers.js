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
  if (req.body['AddRow']) {
        let iString = 'INSERT INTO Customers (`password`,`customer_type`,`name`,`phone`,`is_admin`) VALUES ("'
        +req.body.password
        +'","'+req.body.customer_type
        +'","'+req.body.name
        +'","'+req.body.phone
        +'","'+req.body.is_admin
        + '")';
      mysql.pool.query(iString,function (err) {
        if(err){
          next(err)
          return
        }
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
        }
      )
  }/*end add item if*/
  res.redirect('/customers')
}); /*End app.Post('/') */
