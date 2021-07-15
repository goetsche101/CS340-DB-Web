const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/customers', function(req, res, next) {
  var context = req.context
  /* Select */
  mysql.pool.query('SELECT * FROM CUSTOMERS', function(err, rows, fields){
    context.data_rows = rows
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM CUSTOMERS WHERE FIELD != \'customer_id\'', function(err, rows, fields){
    context.column_list = rows
    res.render('customers', context)
    });
  });
});

router.post('/customers',function (req,res,next) {
  console.log(req.body)
  if (req.body['AddRow']) {
    console.log('afteraddrow', req.body['AddRow'])
        let iString = 'INSERT INTO CUSTOMERS (`password`,`customer_type`,`name`,`phone`,`is_admin`) VALUES ("'
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
    console.log(req.body.customer_id)
      mysql.pool.query('DELETE FROM customers WHERE customer_id =' + req.body.customer_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/
      })/*end mysql.query*/
  }/*end add item if*/
  res.redirect('/customers')
}); /*End app.Post('/') */
