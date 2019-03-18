var express = require('express'),
	bodyParser = require('body-parser'),
	router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

function getEmployees(res, mysql, context, complete){
	mysql.pool.query("SELECT CONCAT(E.fname, ' ', E.lname) AS EmployeeName, R.title AS EmployeeTitle, E.employee_id FROM employees E INNER JOIN roles R ON E.role_id = R.role_id;",
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.employees = rows;
		complete();
	})
}

function getEmployee(res, mysql, context, complete, employeeID){
	mysql.pool.query("SELECT * FROM employees WHERE employee_id = ?",
	employeeID,
	function(err, result){
		if(err){
			next(err);
			return;
		}
		context.employee = result[0];
		complete();
	});
}

//===================================
// EMPLOYEE ROUTES
//===================================

//INDEX - show all employees
router.get('/', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getEmployees(res, mysql, context, complete);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 1){
  		res.render('employees/index', context);
  	}
  }
});

//CREATE - add new employee to db
router.post('/', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("INSERT INTO employees (fname, lname, role_id) VALUES (?, ?, ?);",
	[req.body.fname, req.body.lname, req.body.roleID],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/employees');
});

//EDIT - renders edit employee page
router.get('/:id/edit', function(req, res, next){
	var mysql = req.app.get('mysql');
	var context = {};
	var callbackCount = 0;
	var employeeID = req.params.id;
	getEmployee(res, mysql, context, complete, employeeID);
	function complete (){
		callbackCount++;
		if(callbackCount >= 1){
			res.render('employees/edit', context);
		}
	}
});

//UPDATE - updates employee
router.put('/:id', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("UPDATE employees SET fname = ?, lname = ?, role_id = ? WHERE employee_id = ?",
	[req.body.fname, req.body.lname, req.body.roleID, req.body.id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/employees');
});

//DELETE - deletes employee
router.delete('/:id', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("DELETE FROM employees WHERE employee_id = ?",
	req.body.id,
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/employees');
});

module.exports = router;
