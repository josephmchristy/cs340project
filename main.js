var express = require("express"),
    mysql = require("./DBcon.js"),
    handlebars = require("express-handlebars").create({defaultLayout: "main"}),
    bodyParser = require('body-parser'),
    customers = require('./routes/customers.js');

var app = express();

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", 2382);
app.set('mysql', mysql);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/customers', customers);

app.post("/", function(req, res, next){
  var context = {};

  // if(req.body["Edit"]){
  //   mysql.pool.query("SELECT * FROM customers WHERE id = ?", req.body.id, function(err, result){
  //     if(err){
  //       next(err);
  //       return;
  //     }
  //     context.results = result[0];
  //     res.render('edit', context);
  //   });
  // }

  // if(req.body["Update"]){
  //   mysql.pool.query("SELECT * FROM workouts WHERE id = ?", req.body.id, function(err, result){
  //     if(err){
  //       next(err);
  //       return;
  //     }
  //     if(result.length == 1){
  //       var curVals = result[0];
  //       mysql.pool.query("UPDATE workouts SET name = ?, reps = ?, weight = ?, date = ?, lbs = ? WHERE id = ?",
  //         [req.body.name || curVals.name, req.body.reps || curVals.reps, req.body.weight || curVals.due, req.body.date || curVals.date, req.body.lbs || curVals.lbs, req.body.id],
  //         function(err, result){
  //           if(err){
  //             next(err);
  //             return;
  //           }
  //           res.redirect('/');
  //         });
  //     }
  //   });
  // }

 
  
});


app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get("port"), function(){
  console.log("Express started on http://localhost:" + app.get("port"));
});