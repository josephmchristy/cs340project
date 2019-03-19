var express = require('express'),
	bodyParser = require('body-parser'),
	router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

function getMenus(res, mysql, context, complete){
	mysql.pool.query("SELECT M.menu_id, M.name, F.food_id, F.name AS food FROM menus M LEFT JOIN food_menu FM ON FM.menu_id = M.menu_id LEFT JOIN food F ON F.food_id = FM.food_id GROUP BY M.name ORDER BY M.name DESC;",
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.menus = rows;
		complete();
	})
}

function getMenu(res, mysql, context, complete, menuID){
	mysql.pool.query("SELECT M.menu_id, M.name, F.food_id, F.name AS food FROM menus M LEFT JOIN food_menu FM ON FM.menu_id = M.menu_id LEFT JOIN food F ON F.food_id = FM.food_id WHERE M.menu_id = ? ORDER BY M.name DESC;",
  [menuID],
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.menu = rows;
		complete();
	})
}

function getMenuEntry(res, mysql, context, complete, menuID){
	mysql.pool.query("SELECT M.menu_id, M.name, F.food_id, F.name AS food FROM menus M LEFT JOIN food_menu FM ON FM.menu_id = M.menu_id LEFT JOIN food F ON F.food_id = FM.food_id WHERE M.menu_id = ? AND F.food_id = ? ORDER BY M.name DESC;",
  [menuID, foodID],
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.entry = rows;
		complete();
	})
}

function getFoods(res, mysql, context, complete){
	mysql.pool.query("SELECT name, food_id, calories, price FROM food GROUP BY name;",
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.foods = rows;
		complete();
	});
}

function getFood(res, mysql, context, complete, foodID, menuID){
	mysql.pool.query("SELECT F.name AS food, M.menu_id, M.name AS menu, F.food_id, F.calories, F.price FROM food F INNER JOIN food_menu FM ON FM.food_id = F.food_id INNER JOIN menus M on M.menu_id = FM.menu_id WHERE F.food_id = ? AND M.menu_id = ? ORDER BY M.name DESC;",
  [foodID, menuID],
  function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.food = rows;
		complete();
	});
}

//===================================
// MENU ROUTES
//===================================

//INDEX - show all menus and their foods
router.get('/', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getMenus(res, mysql, context, complete);
  getFoods(res, mysql, context, complete);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 2){
  		res.render('menus/index', context);
  	}
  }
});

//SHOW - show specific menu
router.get('/:id', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  var menuID = req.params.id;
  getMenu(res, mysql, context, complete, menuID);
  getFoods(res, mysql, context, complete);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 2){
      console.log(context.menu);
  		res.render('menus/show', context);
  	}
  }
});

//CREATE - add new menu to db
router.post('/', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("INSERT INTO menus (name) VALUES (?);",
	[req.body.name],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/menus');
});

//CREATE - add food to menu
router.post('/addFood', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("INSERT INTO food_menu (menu_id, food_id) VALUES (?, ?);",
	[req.body.menu_id, req.body.food_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/menus/' + req.body.menu_id + '/edit');
});

//EDIT - renders edit menu page
router.get('/:id/edit', function(req, res, next){
	var mysql = req.app.get('mysql');
	var context = {};
	var callbackCount = 0;
	var menuID = req.params.id;
	getMenu(res, mysql, context, complete, menuID);
  getFoods(res, mysql, context, complete);
	function complete (){
		callbackCount++;
		if(callbackCount >= 2){
			res.render('menus/edit', context);
		}
	}
});

//UPDATE - updates menu
router.put('/:id', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("UPDATE menus SET name = ? WHERE menu_id = ?",
	[req.body.name, req.body.menu_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/menus/' + req.body.menu_id + '/edit');
});

//DELETE - deletes entry
router.delete('/:id', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("DELETE FROM menus WHERE menu_id = ?",
	[req.body.menu_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/menus');
});


//DELETE - deletes menu entry
router.delete('/:id/deleteEntry', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("DELETE FROM food_menu WHERE food_id = ? AND menu_id = ?",
	[req.body.food_id, req.body.menu_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/menus/' + req.body.menu_id + '/edit');
});

module.exports = router;
