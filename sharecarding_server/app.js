var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var redis = require('redis');

//load config file
var database_cnf = require('./config/database');
var redis_cnf = require('./config/redis');
var routes_cnf = require('./config/routes');

//load helper
var public_helper = require('./helpers/public_helper');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: './tmp/' }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//connect to database
mongoose.connect(database_cnf.mongodb);
var client = redis.createClient(redis_cnf.port,redis_cnf.host); //增加超时选项
client.on('error',function(error){
    console.log(error);
});
app.use(function(req, res, next) {
    req.redis = client;
    req.helper = public_helper;
    next();
});

//analytice routes
for(var key in routes_cnf){
    var web_path = key;
    var last_index = routes_cnf[key].lastIndexOf('/');
    var func_path = routes_cnf[key].substr(0,last_index);
    var func_name = routes_cnf[key].substr(last_index+1);
    app.use('/'+key, eval("require('./routes/"+func_path+"')."+func_name));
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
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


module.exports = app;
