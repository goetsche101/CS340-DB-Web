const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/payment_methods', function(req, res, next) {
  var context = req.context
  /* Select */
  mysql.pool.query('SELECT * FROM Payment_methods', function(err, rows, fields){
    context.data_rows = rows
    if(err){
      next(err)
      return
    }
    console.log(rows)
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM Payment_methods WHERE FIELD != \'payment_method_id\'', function(err, rows, fields){
    context.column_list = rows
    if(err){
      next(err)
      return
    }
    res.render('payment_methods', context)
    });
  });
});

router.post('/payment_methods',function (req,res,next) {
  console.log(req.body)
  if (req.body['AddRow']) {
        let iString = 'INSERT INTO Payment_methods (`customer_id`,`type`,`credit_card_number`,`paypal_email`) VALUES ("'
        +req.body.customer_id
        +'","'+req.body.type
        +'","'+req.body.credit_card_number
        +'","'+req.body.paypal_email
        + '")';
        console.log(iString)
      mysql.pool.query(iString,function (err) {
        if(err){
          next(err)
          return
        }
      }); /* Insert Into */
  }else if (req.body['DeleteRow']){
    console.log(req.body.customer_id)
      mysql.pool.query('DELETE FROM payment_methods WHERE payment_method_id =' + req.body.payment_method_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/
      })/*end mysql.query*/
  }/*end add item if*/
  res.redirect('/payment_methods')
}); /*End app.Post('/') */
