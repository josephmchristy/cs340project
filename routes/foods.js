var express = require('express'),
	bodyParser = require('body-parser'),
	router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//===================================
// GET FUNCTIONS
//===================================

function getMenus(res, mysql, context, complete){
	mysql.pool.query("SELECT menu_id, name FROM menus;",
	function(err, rows, fields){
		if(err){
			res.write(JSON.stringify(err));
			res.end();
		}
		context.menus = rows;
		complete();
	})
}

function getFoods(res, mysql, context, complete){
	mysql.pool.query("SELECT F.name AS food, M.menu_id, M.name AS menu, F.food_id, F.calories, F.price FROM food F INNER JOIN food_menu FM ON FM.food_id = F.food_id INNER JOIN menus M on M.menu_id = FM.menu_id ORDER BY M.name DESC;",
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
// FOOD ROUTES
//===================================

//INDEX - show all foods
router.get('/', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
	getFoods(res, mysql, context, complete);
  getMenus(res, mysql, context, complete);
  function complete(){
  	callbackCount++;
  	if(callbackCount >= 2){
  		res.render('foods/index', context);
  	}
  }
});

//CREATE - add new food to db
router.post('/', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("INSERT INTO food (name, calories, price) VALUES (?, ?, ?); INSERT INTO food_menu (food_id, menu_id) VALUES (LAST_INSERT_ID(), ?)",
	[req.body.name, req.body.calories, req.body.price, req.body.menu_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/foods');
});

//EDIT - renders edit food page
router.get('/:id/edit', function(req, res, next){
	var mysql = req.app.get('mysql');
	var context = {};
	var callbackCount = 0;
	var foodID = req.params.id;
  var menuID = req.query['menu_id'];
	getFood(res, mysql, context, complete, foodID, menuID);
	getMenus(res, mysql, context, complete);
	function complete (){
		callbackCount++;
		if(callbackCount >= 2){
			res.render('foods/edit', context);
		}
	}
});

//UPDATE - updates food
router.put('/:id', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("UPDATE food SET name = ?, calories = ?, price = ? WHERE food_id = ?; UPDATE food_menu SET menu_id = ? WHERE food_id = ? AND menu_id = ?",
	[req.body.name, req.body.calories, req.body.price, req.body.food_id, req.body.menu_id, req.body.food_id, req.body.current_menu_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/foods');
});

//DELETE - deletes food
router.delete('/:id', function(req, res, next){
	var mysql = req.app.get('mysql');
	mysql.pool.query("DELETE FROM food WHERE food_id = ?",
	[req.body.food_id],
	function(err, result){
		if(err){
			next(err);
			return;
		}
	});
	res.redirect('/foods');
});

module.exports = router;
