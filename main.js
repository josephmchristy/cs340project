var express = require("express"),
    mysql = require("./DBcon.js"),
    handlebars = require("express-handlebars").create({defaultLayout: "main"}),
    bodyParser = require('body-parser'),
    methodOverride = require("method-override"),
    customers = require('./routes/customers.js'),
    employees = require('./routes/employees.js'),
    orders = require('./routes/orders.js');

var app = express();

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", process.argv[2]);
app.set('mysql', mysql);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.use('/customers', customers);
app.use('/employees', employees);
app.use('/orders', orders);


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
