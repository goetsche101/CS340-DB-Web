const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/emails', function(req, res, next) {
  var context = req.context
  /* Select */
  mysql.pool.query('SELECT * FROM emails', function(err, rows, fields){
    context.data_rows = rows
    if(err){
      next(err)
      return
    }
    console.log(rows)
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM emails WHERE FIELD != \'email_id\'', function(err, rows, fields){
    context.column_list = rows
    if(err){
      next(err)
      return
    }
    res.render('emails', context)
    });
  });
});

router.post('/emails',function (req,res,next) {
  console.log(req.body)
  if (req.body['AddRow']) {
        let iString = 'INSERT INTO emails (`customer_id`,`email_address`,`is_primary`) VALUES ("'
        +req.body.customer_id
        +'","'+req.body.email_address
        +'","'+req.body.is_primary
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
      mysql.pool.query('DELETE FROM emails WHERE email_id =' + req.body.address_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/
      })/*end mysql.query*/
  }/*end add item if*/
  res.redirect('/emails')
}); /*End app.Post('/') */
