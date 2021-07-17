const express = require('express')
var mysql = require('./../dbcon.js')

const router = express.Router()
module.exports = router

router.get('/addresses', function(req, res, next) {
  var context = req.context
  /* Select */
  mysql.pool.query('SELECT * FROM addresses', function(err, rows, fields){
    context.data_rows = rows
    if(err){
      next(err)
      return
    }
    console.log(rows)
    /* Create empty row for insertions */
    mysql.pool.query('SHOW COLUMNS FROM addresses WHERE FIELD != \'address_id\'', function(err, rows, fields){
    context.column_list = rows
    if(err){
      next(err)
      return
    }
    res.render('addresses', context)
    });
  });
});

router.post('/addresses',function (req,res,next) {
  console.log(req.body)
  if (req.body['AddRow']) {
        let iString = 'INSERT INTO addresses (`customer_id`,`address_1`,`address_2`,`city`,`state`,`zip`) VALUES ("'
        +req.body.customer_id
        +'","'+req.body.address_1
        +'","'+req.body.address_2
        +'","'+req.body.city
        +'","'+req.body.state
        +'","'+req.body.zip
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
      mysql.pool.query('DELETE FROM addresses WHERE address_id =' + req.body.address_id, function(err){
        if(err){
          next(err)
          return
        } /*endif*/
      })/*end mysql.query*/
  }/*end add item if*/
  res.redirect('/addresses')
}); /*End app.Post('/') */
