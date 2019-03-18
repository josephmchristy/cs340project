var express = require('express'),
	bodyParser = require('body-parser');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

function getEmployees(res, mysql, context, complete){
	mysql.pool.query("SELECT CONCAT(E.fname, ' ', E.lname) AS EmployeeName, R.title AS EmployeeTitle, ME.manager_id AS ManagerID, E.employee_id FROM employees E INNER JOIN roles R ON E.role_id = R.role_id LEFT JOIN manager_employee ME ON ME.employee_id = E.employee_id;",
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.results = rows;
		complete();
	})
}

router.get('/', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getEmployees(res, mysql, context, complete);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 1){
  		res.render('employees', context);
  	}
  }
});

router.post('/', function(req, res, next){
	var mysql = req.app.get('mysql');

	 if(req.body["Delete"]){
	    mysql.pool.query("DELETE FROM employees WHERE employee_id = ?", req.body.id, function(err, result){
	      if(err){
	        next(err);
	        return;
	      }
	    });
	    res.redirect('/employees');
	  }

	  if(req.body["AddEmployee"]){
	    mysql.pool.query("INSERT INTO employees (fname, lname, role_id) VALUES (?, ?, ?);", [req.body.fname, req.body.lname, req.body.roleID], function(err, result){
	      if(err){
	        next(err);
	        return;
	      }
	    });
	    res.redirect('/employees');
	  }

	if(req.body["Edit"]){
		var context = {};
   		mysql.pool.query("SELECT * FROM employees WHERE employee_id = ?", req.body.id, function(err, result){
      		if(err){
        		next(err);
        		return;
      		}
    	context.results = result[0];
    	res.render('edit-employee', context);
    });
  }

   if(req.body["Update"]){
	    mysql.pool.query("UPDATE employees SET fname = ?, lname = ?, role_id = ? WHERE employee_id = ?",
	      [req.body.fname, req.body.lname, req.body.roleID, req.body.id],
	      function(err, result){
	        if(err){
	          next(err);
	          return;
	        }      
      });
	res.redirect('/employees');
  }
});

module.exports = router;