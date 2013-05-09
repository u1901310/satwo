
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
app.get('/clearAllSATWO', routes.clearAll);
app.get('/clearAllUsersSATWO', routes.clearAllUsers);
app.get('/clearAllGamesSATWO', routes.clearAllGames);
app.get('/clearAllFactionsSATWO', routes.clearAllFactions);
app.get('/games', routes.findAllGames);
app.get('/users', routes.findAll);
//----------------------------------
app.get('/login/:username/:password', routes.login);
app.get('/userByUsername/:username', routes.findByUsername);
app.post('/addUser', routes.addUser);
app.get('/userGames/:user_id', routes.findUserGames);
app.get('/publicGames', routes.findPublicGames);
app.post('/addGame', routes.addGame);
app.post('/initGame', routes.initGame);
app.post('/sendRequest', routes.sendRequest);
app.post('/rejectRequest', routes.rejectRequest);
app.post('/addFriend', routes.addFriend);
app.post('/removeFriend', routes.removeFriend);
app.get('/getRequests/:username', routes.getRequests);
app.get('/getFriends/:username', routes.getFriends);
app.get('/getUserUsername/:user_id', routes.getUserUsername);
app.post('/addGameToUser', routes.addGameToUser);
app.post('/linkGameAndUser', routes.linkGameAndUser);
app.post('/unlinkGameAndUser', routes.unlinkGameAndUser);
app.get('/gameIsFull/:game_id', routes.gameIsFull);
app.get('/gameIsSecure/:game_id', routes.gameIsSecure);
app.post('/validateGamePassword', routes.validateGamePassword);
app.get('/getGame/:game_id', routes.getGame);
app.post('/confirmUserToGame', routes.confirmUserToGame);
app.get('/getFactions', routes.getFactions);
app.get('/getTerritories', routes.getTerritories);
app.get('/getGameTurn/:game_id', routes.getGameTurn);
app.post('/setGameTurn', routes.setGameTurn);
app.get('/getGameRound/:game_id', routes.getGameRound);
app.post('/setGameRound', routes.setGameRound);
app.post('/setTerritoryRuler', routes.setTerritoryRuler);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//web socket
var io = require('socket.io').listen(server);
io.set('log level', 1);

//app.post('/sendRequest', function (req, res) {
//    res.sendfile(__dirname + '/public/html/main_page.html');
//});

var usernames = {};

io.sockets.on('connection', function (socket) {
    socket.on('request_sent', function (data) {
        io.sockets.emit('request_received', { info: 'received'});
    });

    socket.on('friend_sent', function (data) {
        io.sockets.emit('friend_received', { info: 'received'});
    });

    socket.on('new_game_sent', function (data) {
        io.sockets.emit('new_game_received', { info: 'received'});
    });

    //When a user enter un a game, info send {info1: game_id, info2: user_id}
    socket.on('enter_game_sent', function (data) {
        io.sockets.emit('enter_game_received', { info1: data.info1, info2: data.info2});
    });

    //When a user confirm his participation to a game, info send {info: game_id}
    socket.on('room_user_confirmation_sent', function (data) {
        io.sockets.emit('room_user_confirmation_received', { info: data.info});
    });

    //When a user leave a game (it could be the room_admin),info send {info: game_id}
    socket.on('room_leave_sent', function(data) {
        io.sockets.emit('room_leave_received', {info: data.info});
    });

    //When room administrator expels a user from a game, info send {info1: game_id, info2: user_id}
    socket.on('room_user_expelled_sent', function(data) {
        io.sockets.emit('room_user_expelled_received', {info1: data.info1, info2: data.info2});
    });

    socket.on('start_game_sent', function (data) {
        io.sockets.emit('start_game_received', {info: data.game_id});
    });

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', socket.username, data);
    });

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function (username) {
        // we store the username in the socket session for this client
        socket.username = username;

        // add the client's username to the global list
        usernames[username] = username;

        // echo to client they've connected
        socket.emit('updatechat', 'SERVER', 'you have connected');

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');

        // upadate the list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
    });

    // when the clients emits 'removeuser', this listens and executes
    socket.on('removeuser', function(){
        // remove the username from global usernames list
        delete usernames[socket.username];

        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);

        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    });

    // when the user disconnects... perform this
    socket.on('disconnect', function(){
        // remove the username from global usernames list
        delete usernames[socket.username];

        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);

        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    });
});
