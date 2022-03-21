require("./api/config/DBConnection");
var express = require('express'),
  app = express(),
  port = process.env.PORT || 3001,
  bodyParser = require("body-parser");

var morgan = require('morgan'),
jwt = require('jsonwebtoken'),
SECRET  = require("./api/config").SECRET;

// Middleware To Log All Incoming Requests
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/*
  Middleware to parse the request body that is in format "application/json" or
  "application/x-www-form-urlencoded" as json and make it available as a key on the req
  object as req.body
*/
var jsonParser = bodyParser.json({ limit: 1024 * 1024 * 20, type: 'application/json' });
var urlencodedParser = bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 * 20, type: 'application/x-www-form-urlencoded' })

app.use(jsonParser);
app.use(urlencodedParser);


app.use(function(req, res, next) {
	if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
	  jwt.verify(req.headers.authorization.split(' ')[1], SECRET, function(err, decode) {
		if (err) req.user = undefined;
		req.user = decode;
		next();
	  });
	} else {
	  req.user = undefined;
	  next();
	}
});

var routes = require('./api/routes/');
routes(app);
  
  

// Middleware to handle any (500 Internal server error) that may occur while doing database related functions
app.use(function (err, req, res, next) {
	if (err.statusCode === 404) return next();
	res.status(500).json({
		err: process.env.NODE_ENV === "production" ? null : err,
		msg: "Something went wrong! We are very sorry.",
		data: null
	});
});

/*
  Middleware to handle any (404 Not Found) error that may occur if the request didn't find
  a matching route on our server, or the requested data could not be found in the database
*/
app.use(function (req, res) {
	res.status(404).json({
		err: null,
		msg: "404 Not Found.",
		data: null
	});
});



app.listen(port);

console.log('url-monitor-api Started On Port: ' + port);