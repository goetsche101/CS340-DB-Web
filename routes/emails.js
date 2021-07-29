const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/emails', function(req, res, next) {
  var context = req.context
  /* Select */
  var emails = 'SELECT email_id, c.name, email_address, is_primary FROM Emails e LEFT JOIN Customers c ON e.customer_id = c.customer_id'
  mysql.pool.query(emails, function(err, rows, fields){
    context.data_rows = rows
    if(err){
      next(err)
      return
    }
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM Emails WHERE FIELD != \'email_id\'AND FIELD != \'Customer_id\'', function(err, rows, fields){
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
      res.render('emails', context)
      });/*End Customers select */
    }); /* end show columns */
  }); /* end SELECT ALL */
});

router.post('/emails',function (req,res,next) {
  console.log(req.body)
  if (req.body['AddRow']) {
        let insert_sql = 'INSERT INTO Emails (`customer_id`,`email_address`,`is_primary`) VALUES (?,?,?)'
        let values = [req.body.customer_id ,req.body.email_address,req.body.is_primary]
      mysql.pool.query(insert_sql, values,function (err) {
        if(err){
          next(err)
          return
        }
      }); /* Insert Into */
  }else if (req.body['DeleteRow']){
    console.log(req.body.customer_id)
      mysql.pool.query('DELETE FROM Emails WHERE email_id =' + req.body.address_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/
      })/*end mysql.query*/
  }/*end add item if*/
  res.redirect('/emails')
}); /*End app.Post('/') */
