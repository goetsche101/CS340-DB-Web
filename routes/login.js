const express = require('express');
var mysql = require('../dbcon.js');

const router = express.Router();
module.exports = router;

router.get('/login', function(req, res, next) {

  var context = req.context;
  res.render('login', context);
});


router.post('/login', function(req, res, next) {

  var context = req.context;
  res.render('login', context);
});
