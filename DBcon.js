var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_christyj',
  password        : '2369',
  database        : 'cs340_christyj',
  dateString      : 'date' 
});

module.exports.pool = pool;