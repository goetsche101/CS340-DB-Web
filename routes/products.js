const express = require('express');
var mysql = require('../dbcon.js');

const router = express.Router();
module.exports = router;

router.get('/products', function(req, res, next) {

  var context = req.context;

  var query = 'SELECT * FROM Products';
  if (req.query.search) {
    query = `SELECT * FROM Products WHERE lower(description) LIKE '%${req.query.search.toLowerCase()}%'`;
  }
  else if (req.query.category_id) {
    query = `
      SELECT * FROM Products
      LEFT JOIN Products_categories_relation
      ON Products_categories_relation.product_id = Products.product_id
      WHERE Products_categories_relation.category_id = ${req.query.category_id};
    `;
  }

  mysql.pool.query(query, function(err, rows, fields){

    if (err) {
      next(err);
      return;
    }

    for (const product of rows) {
      product.price = '$' + product.price;
    }

    context.products = rows;


    mysql.pool.query('SELECT * FROM Categories', function(err, rows, fields){

      if (err) {
        next(err);
        return;
      }
      context.categories = rows;
      res.render('products', context)
    });/*end mysql.pool inner*/
  });/*end mysql.pool outer*/

});

router.post('/products/add', function (req, res, next) {

  // Don't allow blank category names
  if (
    !req.body.description || !req.body.description.trim().length ||
    !req.body.in_stock_qty || !req.body.in_stock_qty.length ||
    !req.body.price || !req.body.price.length
  ) {
    res.redirect('/products');
    return;
  }

  // Don't allow certain strings used to concatinate data in certain requests
  for (const divider of ['<END>', '<SPLIT>']) {
    if (req.body.description.includes(divider)) {
      res.redirect('/products');
      return;
    }
  }

  const query = 'INSERT INTO Products (description, in_stock_qty, price) VALUES (?, ?, ?)';
  const values = [req.body.description, req.body.in_stock_qty, req.body.price];

  mysql.pool.query(query, values, function (error, results, fields) {
    if (error) {
      console.log(error);
      next(error);
      return;
    }

    for(const key in Object.keys(req.body.categories)){
      const qstring =`INSERT INTO Products_categories_relation(category_id, product_id) VALUES(`+req.body.categories[key]+`,`+results.insertId+`)`
      mysql.pool.query(qstring, function(error, results, fields){
        if(error){
          console.log(error)
          next(error)
          return
        }
      })/*end inner mysql*/
    }/*end for*/
    res.redirect('/products');
  });/*end outer mysql*/
});/* end post*/
