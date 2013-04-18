
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//Administration functions
app.get('/clearAllUsersSATWO', routes.clearAllUsers);
app.get('/clearAllGamesSATWO', routes.clearAllGames);
app.get('/games', routes.findAllGames);
app.get('/users', routes.findAll);
//----------------------------------
app.get('/login/:username/:password', routes.login);
app.get('/userByUsername/:username', routes.findByUsername);
app.post('/addUser', routes.addUser);
app.get('/userGames/:user_id', routes.findUserGames);
app.get('/publicGames', routes.findPublicGames);
app.post('/addGame', routes.addGame);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
