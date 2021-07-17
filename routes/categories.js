const express = require('express');
var mysql = require('../dbcon.js');

const router = express.Router();
module.exports = router;

router.get('/categories', function(req, res, next) {

  var context = req.context;

  mysql.pool.query('SELECT * FROM Categories', function(err, rows, fields){

    if (err) {
      next(err);
      return;
    }

    context.categories = rows;
    res.render('categories', context);
  });
});

router.post('/categories/add', function (req, res, next) {

  // Don't allow blank category names
  if (!req.body.category_name || !req.body.category_name.trim().length) {
    res.redirect('/categories');
    return;
  }

  const query = 'INSERT INTO Categories (category_name) VALUES (?)';
  const values = [req.body.category_name];

  mysql.pool.query(query, values, function (err) {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/categories');
  });
});

router.post('/categories/delete', function (req, res, next) {

  const query = 'DELETE FROM Categories WHERE category_id = ?';
  const values = [req.body.category_id];

  mysql.pool.query(query, values, function (err) {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/categories');
  });
});

