const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
router.get('/messages',(req, res)=> {
  console.log("testing")
  res.end()
})

module.exports = router

router.get('/customers', function(req, res, next) {

  var context = req.context;
  createString = `
  CREATE TABLE IF NOT EXISTS CUSTOMERS (
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
  mysql.pool.query('SHOW COLUMNS FROM CUSTOMERS', function(err, rows, fields){
    /* Build table header */
    console.log(rows)
  context.data = rows
  console.log(context.data)
  res.render('customers',context);
  }); /* Select */
});

router.post('/customers',function (req,res,next) {
  console.log(req.body['AddRow'])
  if (req.body['AddRow']) {
    let iString = 'INSERT INTO CUSTOMERS (`password`,`customer_type`,`name`,`phone`,`is_admin`) VALUES ("'+
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
  res.redirect('/customers')
}); /*End app.Post('/') */
