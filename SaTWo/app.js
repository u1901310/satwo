
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
app.get('/users', routes.findAll);
app.get('/login/:username/:password', routes.login);
app.get('/userByUsername/:username', routes.findByUsername);
app.post('/addUser', routes.addUser);
app.post('/sendRequest', routes.sendRequest);
app.post('/rejectRequest', routes.rejectRequest);
app.post('/addFriend', routes.addFriend);
app.post('/removeFriend', routes.removeFriend);
app.get('/getRequests/:username', routes.getRequests);
app.get('/getFriends/:username', routes.getFriends);
app.get('/remove', routes.removeUsers);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
