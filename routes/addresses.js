const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/addresses', function(req, res, next) {
  var context = req.context
  /* Select */
  var address = 'SELECT address_id, C.name, address1, address2, city, state, zip FROM Addresses A LEFT JOIN Customers C ON A.customer_id = C.Customer_id'
  mysql.pool.query(address, function(err, rows, fields){
    context.data_rows = rows
    if(err){
      next(err)
      return
    }
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM Addresses WHERE FIELD != \'address_id\' AND FIELD != \'Customer_id\'', function(err, rows, fields){
    context.column_list = rows
    if(err){
      next(err)
      return
    }
      mysql.pool.query('SELECT customer_id, name FROM Customers', function(err, rows, fields){
        context.customers = rows
        res.render('addresses', context)
      });/*end Customer select*/
    });/*End Show coluumns*/
  });/* End SELECT ALL */
});

router.post('/addresses',function (req,res,next) {
  if (req.body['AddRow']) {
        let sql = 'INSERT INTO Addresses (`customer_id`,`address1`,`address2`,`city`,`state`,`zip`) VALUES (?,?,?,?,?,?)'
        let values = [req.body.customer_id,req.body.address1,req.body.address2,req.body.city,req.body.state,req.body.zip]
      mysql.pool.query(sql, values,function (err) {
        if(err){
          next(err)
          return
        }
      }); /* Insert Into */
  }else if (req.body['DeleteRow']){
      mysql.pool.query('DELETE FROM Addresses WHERE address_id =' + req.body.address_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/
      })/*end mysql.query*/
  }/*end add item if*/
  res.redirect('/addresses')
}); /*End app.Post('/') */
