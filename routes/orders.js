var express = require('express'),
	bodyParser = require('body-parser');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//===================================
// GET FUNCTIONS
//===================================

function getAllOrders(res, mysql, context, complete, customerID){
	mysql.pool.query("SELECT CONCAT(C.fname, ' ', C.lname) AS CustomerName, O.order_id AS OrderNumber, F.name AS FoodOrdered, FP.TotalPrice, C.customer_id, F.food_id FROM customers C INNER JOIN orders O on O.customer_id = C.customer_id LEFT JOIN food_orders FO on FO.order_id = O.order_id LEFT JOIN food F on F.food_id = FO.food_id LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O INNER JOIN food_orders FO ON FO.order_id = O.order_id INNER JOIN food F on F.food_id = FO.food_id GROUP BY order_id) FP on FP.order_id = O.order_id GROUP BY OrderNumber ORDER BY CustomerName;",
	function(err, rows, fields){
	    if(err){
	      res.write(JSON.stringify(err));
	      res.end();
	    }
	    context.all_orders = rows;
	    complete();
	});
}

function getOrders(res, mysql, context, complete, customerID){
	mysql.pool.query("SELECT CONCAT(C.fname, ' ', C.lname) AS CustomerName, O.order_id AS OrderNumber, F.name AS FoodOrdered, FP.TotalPrice, C.customer_id, F.food_id FROM customers C LEFT JOIN orders O on O.customer_id = C.customer_id LEFT JOIN food_orders FO on FO.order_id = O.order_id LEFT JOIN food F on F.food_id = FO.food_id LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O INNER JOIN food_orders FO ON FO.order_id = O.order_id INNER JOIN food F on F.food_id = FO.food_id GROUP BY order_id) FP on FP.order_id = O.order_id WHERE C.customer_id = ? GROUP BY OrderNumber, CustomerName, FoodOrdered ORDER BY CustomerName;",
	[customerID],
	function(err, rows, fields){
	    if(err){
	      res.write(JSON.stringify(err));
	      res.end();
	    }
	    context.orders = rows;
	    complete();
	});
}

function getOrder(res, mysql, context, complete, orderID){
	mysql.pool.query("SELECT O.order_id AS OrderNumber, F.name AS FoodOrdered, F.price, FP.TotalPrice, F.food_id FROM orders O LEFT JOIN food_orders FO on FO.order_id = O.order_id LEFT JOIN food F on F.food_id = FO.food_id LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O INNER JOIN food_orders FO ON FO.order_id = O.order_id INNER JOIN food F on F.food_id = FO.food_id GROUP BY order_id) FP on FP.order_id = O.order_id WHERE O.order_id = ?;",
	[orderID],
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.items = rows;
		complete();
	});
}

function getFoods(res, mysql, context, complete){
	mysql.pool.query("SELECT F.name AS food, M.name AS menu, F.food_id FROM food F INNER JOIN food_menu FM ON FM.food_id = F.food_id INNER JOIN menus M on M.menu_id = FM.menu_id GROUP BY food ORDER BY M.name DESC;",
	function(err, rows, fields){
		if(err){
			res.write(JOSN.stringify(err));
			res.end();
		}
		context.foods = rows;
		complete();
	});
}

function getCustomers(res, mysql, context, complete){
	mysql.pool.query("SELECT CONCAT(fname, ' ', lname) AS CustomerName, customer_id FROM customers;",
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.customers = rows;
		complete();
	});
}

function getCustomer(res, mysql, context, complete, customerID){
	mysql.pool.query("SELECT * FROM customers WHERE customer_id = ?", customerID,
	function(err, result){
		if(err){
			next(err);
			return;
		}
		context.customer = result[0];
		complete();
	});
}

//===================================
// ORDER ROUTES
//===================================

//INDEX - show all orders
router.get('/', function(req, res, next){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  var customerID = req.params.id;
  getAllOrders(res, mysql, context, complete, customerID);
	getFoods(res, mysql, context, complete);
	getCustomers(res, mysql, context, complete);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 3){
  		res.render('orders/index', context);
  	}
  }
});

//INDEX - show all orders for particular customer
router.get('/:id', function(req, res, next){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  var customerID = req.params.id;
  getOrders(res, mysql, context, complete, customerID);
  getFoods(res, mysql, context, complete);
	getCustomer(res, mysql, context, complete, customerID);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 3){
  		res.render('orders/show', context);
  	}
  }
});

//CREATE - add a new order
router.post('/', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("INSERT INTO orders (customer_id) VALUES (?)",
	[req.body.customer_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/orders/' + req.body.customer_id);
});

//EDIT - renders edit order page
router.get('/:orderID/edit', function(req, res, next){
	var callbackCount = 0;
	var context = {};
	var mysql = req.app.get('mysql');
	var orderID = req.params.orderID;
	getOrder(res, mysql, context, complete, orderID);
	getFoods(res, mysql, context, complete);
	function complete(){
		callbackCount++;
		if(callbackCount >= 2){
			console.log(context.items);
			res.render('orders/edit', context);
		}
	}
});

//UPDATE - adds food to order
router.put('/:id', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("INSERT INTO food_orders (order_id, food_id) VALUES (?, ?)",
	[req.body.order_id, req.body.food_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/orders/' + req.body.order_id + '/edit');
});

//DELETE - deletes food from order
router.delete('/:id', function(req, res, next){
	console.log(req.body.order_id);
	var mysql = req.app.get('mysql');
	mysql.pool.query("DELETE FROM food_orders WHERE order_id = ? AND food_id = ?",
	[req.body.order_id, req.body.food_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/orders/' + req.body.order_id + '/edit');
});

//DELETE - deletes entire order
router.delete('/delete/:id', function(req, res, next){
	console.log(req.body.order_id);
	var mysql = req.app.get('mysql');
	mysql.pool.query("DELETE FROM orders WHERE order_id = ?",
	[req.body.order_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/orders/');
});

module.exports = router;
