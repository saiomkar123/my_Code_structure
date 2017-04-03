var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var passport = require('passport');
var passportlocal = require('passport-local');
var socket_io = require('socket.io');
var morgan = require('morgan');
var flash = require('connect-flash');
var settings = require('./routes/config');
var multer = require('multer');


var routes = require('./routes/index');
var users = require('./routes/users');
var device = require('./routes/device');
var mobile = require('./routes/mob');
// var login = require('./routes/login');
var register = require('./routes/register');
var db = require('./routes/db');
var httpMsgs = require('./routes/httpMsgs');
var test = require('./routes/test');
var emp = require('./routes/emp');
var sch = require('./routes/switch');
var developer = require('./routes/developer');
var web = require('./routes/web');
var field = require('./routes/field');


var app = express();

// socket io setup
var io = socket_io();
 app.io = io;
 // socket.io events
  io.on('connection', function(socket){
    console.log('User connected');
  });

app.io.set('origins', settings.main_url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.all('*', function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'tmt',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());  // use connect-flash for flash messages stored in session
app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));


app.use('/', routes);
app.use('/users', ensureAuthenticated, users);
app.use('/register', register);
app.use('/switch', sch);
app.use('/device', device(app.io));
app.use('/mobile', mobile(app.io));
app.use('/test', test);
app.use('/emp', emp);
app.use('/developer', developer(app.io));
app.use('/web', web(app.io));
app.use('/field', field(app.io));



// login
passport.use(new passportlocal.Strategy(verifyCredentials));

app.get('/login', function(req, res){
  res.render('login', {error: ""});
});
app.get('/login/:code', function(req, res){
  res.render('login',{error: "User name and password not matched."});
});

app.get('/dash', function(req, res){
  console.log("connect>sid: "+req.cookies['connect.sid']);
  var user_details = [];
  var devices = [];
  var devices_id = [];

  if(req.isAuthenticated() && req.cookies['connect.sid'] != null){
    // user_details['name'] = req.user[0].name;
    // user_details['email'] = req.user[0].email;
    // user_details['dob'] = req.user[0].dob;
    // user_details['user_id'] = req.user[0].userid;
    // user_details['others']  = JSON.stringify([req.user[0].password, req.user[0].status, req.user[0].weather, req.user[0].news, req.user[0].latitude, req.user[0].longitude]);

    for(var i = 0; i< req.user.length; i++){
       // var sub_device = [];
       // sub_device['device_id'] = req.user[i].device_id;
       devices_id.push(req.user[i].device_id);
    }
    // console.log(req);
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.render('dash', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      device: devices,
      devices_id: devices_id
    });
  }else {
    res.redirect('/login');
  }
  // console.log(req.user[0]);
});

app.get('/logout', function(req, res){
  req.cookies['connect.sid'] = null;
  console.log(req.cookies['connect.sid']);
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.redirect('/');
  // req.session.destroy(function(){
  //   res.clearCookie('connect.sid');
    
  // });
});

app.post('/login', passport.authenticate('local', { successRedirect: '/dash',
                                 failureRedirect: 'login/Error'}), function(req, res){
  // res.redirect('/dash');
  console.log(req.body);
  console.log('getting post');
});

passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(user, done){
  done(null, user);
});


function verifyCredentials(username, password, done){
  if(!username || !password){
    res.write("Enter username and password");
  }else{
    // var sql = "SELECT user.*, device.device_id, templog.* FROM users user JOIN (SELECT * FROM deviceslist) AS device ON device.user_id = user.userid JOIN (select device_id, temp, humidity, r1, r2, r3, MAX(id) as id from readings_log group by device_id order by id asc) AS templog ON templog.device_id = device.device_id WHERE user.name = '"+username+"' AND user.mobile = '"+password+"'";
    var sql = "SELECT users.*, deviceslist.device_id FROM users JOIN deviceslist on deviceslist.user_id = users.userid WHERE users.name = '"+username+"' AND users.mobile = '"+password+"'";
    db.executeSql(sql, function(data, err){
      if(data == ""){
       // res.write("you are not registered");
        console.log(data);
        done(null, null)
        
      }else{
        // console.log(data);
        done(null, data);
      }
    });
  }
};


function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    next();
  }else{
    res.redirect('/login');
  }
};


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
