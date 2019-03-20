var express = require('express'),
router = express.Router(),
bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//===================================
// GET FUNCTIONS
//===================================

function getCustomer(res, mysql, context, complete, customerID){
	mysql.pool.query("SELECT * FROM customers WHERE customer_id = ?",
	customerID,
	function(err, result){
		if(err){
			next(err);
			return;
		}
		context.customer = result[0];
		complete();
	});
}

function getCustomers(res, mysql, context, complete){
	mysql.pool.query("SELECT CONCAT(fname, ' ', lname) AS CustomerName, customer_id FROM customers",
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.customers = rows;
		complete();
	});
}

//===================================
// CUSTOMER ROUTES
//===================================

//INDEX - show all customers and their orders
router.get('/', function(req, res){
	var callbackCount = 0;
	var context = {};
	var mysql = req.app.get('mysql');
	getCustomers(res, mysql, context, complete);
	function complete(){
		callbackCount++;
		if(callbackCount >= 1){
			res.render('customers/index', context);
		}
	}
});


//CREATE - add new customer to db
router.post('/', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("INSERT INTO customers (fname, lname) VALUES (?, ?);",
	[req.body.fname, req.body.lname],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/customers');
});

//EDIT - renders edit customer page
router.get('/:id/edit', function(req, res, next){
	var mysql = req.app.get('mysql');
	var context = {};
	var callbackCount = 0;
	var customerID = req.params.id;
	getCustomer(res, mysql, context, complete, customerID);
	function complete (){
		callbackCount++;
		if(callbackCount >= 1){
			res.render('customers/edit', context);
		}
	}
});

//UPDATE - updates customer
router.put('/:id', function(req,res){
	var mysql = req.app.get('mysql');
	mysql.pool.query("UPDATE customers SET fname = ?, lname = ? WHERE customer_id = ?",
	[req.body.fname, req.body.lname, req.body.id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/customers');
});

//DELETE - deletes customer
router.delete("/:id", function(req, res){
	var mysql = req.app.get('mysql');
	mysql.pool.query("DELETE FROM customers WHERE customer_id = ?",
	req.body.id,
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/customers');
});




	module.exports = router;
