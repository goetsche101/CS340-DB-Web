var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'adam',
  password        : 'password',
  database        : 'test'
  ,dateStrings:true
});

module.exports.pool = pool;
