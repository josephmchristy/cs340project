var express = require('express'),
	bodyParser = require('body-parser');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', function(req, res, next){
  var context = {};
  var mysql = req.app.get('mysql');
  mysql.pool.query("SELECT CONCAT(C.fname, ' ', C.lname) AS CustomerName, O.order_id AS OrderNumber, F.name AS FoodOrdered, FP.TotalPrice, C.customer_id FROM customers C LEFT JOIN orders O on O.customer_id = C.customer_id LEFT JOIN food_orders FO on FO.order_id = O.order_id LEFT JOIN food F on F.food_id = FO.food_id LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O INNER JOIN food_orders FO ON FO.order_id = O.order_id INNER JOIN food F on F.food_id = FO.food_id GROUP BY order_id) FP on FP.order_id = O.order_id GROUP BY OrderNumber, CustomerName, FoodOrdered;",
   function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = rows;
    res.render("home", context);
  });
});

router.post('/', function(req, res, next){
	var mysql = req.app.get('mysql');
	 if(req.body["Delete"]){
	    mysql.pool.query("DELETE FROM customers WHERE customer_id = ?", req.body.id, function(err, result){
	      if(err){
	        next(err);
	        return;
	      }
	    });
	    res.redirect('/customers');
	  }

	  if(req.body["AddCustomer"]){
	    mysql.pool.query("INSERT INTO customers (fname, lname) VALUES (?, ?);", [req.body.fname, req.body.lname], function(err, result){
	      if(err){
	        next(err);
	        return;
	      }
	    });
	    res.redirect('/customers');
	  }
});

module.exports = router;