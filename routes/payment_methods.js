const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/payment_methods', function(req, res, next) {
  var context = req.context
  let sql ='SELECT payment_method_id, c.name, type, credit_card_number, paypal_email FROM Payment_methods p LEFT JOIN Customers c on p.customer_id = c.customer_id'
  /* Select */
  mysql.pool.query(sql, function(err, rows, fields){
    context.data_rows = rows
    if(err){
      next(err)
      return
    }
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM Payment_methods WHERE FIELD != \'payment_method_id\' AND FIELD != \'Customer_id\'', function(err, rows, fields){
    context.column_list = rows
    if(err){
      next(err)
      return
    }
    mysql.pool.query('SELECT customer_id, name FROM Customers', function(err, rows, fields){
      context.customers = rows
      if(err){
        next(err)
        return
      }
      res.render('payment_methods', context)
      });
    });
  });
});

router.post('/payment_methods',function (req,res,next) {
  console.log(req.body)
  if (req.body['AddRow']) {
        let insert_sql = 'INSERT INTO Payment_methods (`customer_id`,`type`,`credit_card_number`,`paypal_email`) VALUES (?,?,?,?)'
        let values = [req.body.customer_id,req.body.type,req.body.credit_card_number,req.body.paypal_email]
      mysql.pool.query(insert_sql, values,function (err) {
        if(err){
          next(err)
          return
        }
      }); /* Insert Into */
  }else if (req.body['DeleteRow']){
    console.log(req.body.customer_id)
      mysql.pool.query('DELETE FROM Payment_methods WHERE payment_method_id =' + req.body.payment_method_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/
      })/*end mysql.query*/
  }/*end add item if*/
  res.redirect('/payment_methods')
}); /*End app.Post('/') */
