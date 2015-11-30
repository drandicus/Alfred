/*
  MOST OF THE SCAFFOLDING IS DONE USING EXPRESS GENERATE - AN NPM COMMAND THAT GENERATED THE BASE FOR
  THIS APP.JS
*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var jade = require('jade');
var mongoose = require('mongoose');

/* This Section Connects Mongoose to the Mongo Server */
var db = require('./config/server')
mongoose.connect(db.url);

var app = express();

/* Sets up the View Engine -- Not actually used */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/* Additional Configuration Settings */
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/* Setting up the routes and the api calls */
var routes = require('./routes/index');
var api = require('./routes/api')

app.use('/', routes);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  console.log(req);
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/


module.exports = app;
