var express = require('express'),
	bodyParser = require('body-parser');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

function getOrders(res, mysql, context, complete, customerID){
	mysql.pool.query("SELECT CONCAT(C.fname, ' ', C.lname) AS CustomerName, O.order_id AS OrderNumber, F.name AS FoodOrdered, FP.TotalPrice, C.customer_id, F.food_id FROM customers C LEFT JOIN orders O on O.customer_id = C.customer_id LEFT JOIN food_orders FO on FO.order_id = O.order_id LEFT JOIN food F on F.food_id = FO.food_id LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O INNER JOIN food_orders FO ON FO.order_id = O.order_id INNER JOIN food F on F.food_id = FO.food_id GROUP BY order_id) FP on FP.order_id = O.order_id WHERE C.customer_id = ? GROUP BY OrderNumber, CustomerName, FoodOrdered;",
	[customerID], function(err, rows, fields){
	    if(err){
	      res.write(JSON.stringify(err));
	      res.end();
	    }
	    context.orders = rows;
	    complete();
	});
}

function getFoods(res, mysql, context, complete){
	mysql.pool.query("SELECT F.name AS food, M.name AS menu, F.food_id FROM food F INNER JOIN food_menu FM ON FM.food_id = F.food_id INNER JOIN menus M on M.menu_id = FM.menu_id ORDER BY M.name DESC;",
	function(err, rows, fields){
		if(err){
			res.write(JOSN.stringify(err));
			res.end();
		}
		context.foods = rows;
		complete();
	});
}

router.get('/:id', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  var customerID = req.params.id;
  getOrders(res, mysql, context, complete, customerID);
  getFoods(res, mysql, context, complete);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 2){
  		res.render('orders', context);
  	}
  }
});

router.post('/:id', function(req, res){
	var mysql = req.app.get('mysql');
	console.log(req.body.order_id);
	 if(req.body["Delete"]){
	    mysql.pool.query("DELETE FROM food_orders WHERE order_id = ? AND food_id = ?", [req.body.order_id, req.body.food_id], function(err, result){
	      if(err){
	        next(err);
	        return;
	      }
	    });
	    res.redirect('/orders/' + req.body.customer_id);
	  }
});

module.exports = router;