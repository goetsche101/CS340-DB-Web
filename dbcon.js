var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'cs340_goetsche',
  password        : '1265',
  database        : 'cs340_goetsche'
  ,dateStrings:true
});

module.exports.pool = pool;
