
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
//User functions
app.get('/login/:username/:password', routes.login);
app.get('/userByUsername/:username', routes.findByUsername);
app.post('/addUser', routes.addUser);
app.get('/userGames/:user_id', routes.findUserGames);
app.get('/publicGames', routes.findPublicGames);
app.post('/sendRequest', routes.sendRequest);
app.post('/rejectRequest', routes.rejectRequest);
app.post('/addFriend', routes.addFriend);
app.post('/removeFriend', routes.removeFriend);
app.get('/getRequests/:username', routes.getRequests);
app.get('/getFriends/:username', routes.getFriends);
app.get('/getUserUsername/:user_id', routes.getUserUsername);
//Game functions
app.post('/addGame', routes.addGame);
app.post('/initGame', routes.initGame);
app.post('/addGameToUser', routes.addGameToUser);
app.post('/linkGameAndUser', routes.linkGameAndUser);
app.post('/unlinkGameAndUser', routes.unlinkGameAndUser);
app.get('/gameIsFull/:game_id', routes.gameIsFull);
app.get('/gameIsSecure/:game_id', routes.gameIsSecure);
app.post('/validateGamePassword', routes.validateGamePassword);
app.get('/getGame/:game_id', routes.getGame);
app.post('/confirmUserToGame', routes.confirmUserToGame);
app.get('/getGameTurn/:game_id', routes.getGameTurn);
app.post('/setGameTurn', routes.setGameTurn);
app.get('/nextGameTurn/:game_id', routes.nextGameTurn);
app.get('/getGameRound/:game_id', routes.getGameRound);
app.post('/setGameRound', routes.setGameRound);
app.post('/setTerritoryRuler', routes.setTerritoryRuler);
app.post('/addResourcesFromTerritory', routes.addResourcesFromTerritory);
app.post('/addResourcesFromTerritoryByNumber', routes.addResourcesFromTerritoryByNumber);
app.post('/spendResources', routes.spendResources);
app.post('/updateTerritory', routes.updateTerritory);
app.post('/useWeapons', routes.useWeapons);
app.post('/buyWeapon', routes.buyWeapon);
app.post('/thiefAction', routes.thiefAction);
app.get('/hasTerritoryThief/:game_id/:territory_id', routes.hasTerritoryThief);
app.get('/isWinner/:game_id/:player_id', routes.isWinner);
app.post('/setGameNoPublic', routes.setGameNoPublic);
app.post('/confirmEndGame', routes.confirmEndGame);
//Faction Functions
app.get('/getFactions', routes.getFactions);
//Territory Functions
app.get('/getTerritories', routes.getTerritories);

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

    socket.on('alter_games_list', function() {
       io.sockets.emit('update_games_list');
    });

    //When a user enter un a game, info send {info1: game_id, info2: user_id}
    socket.on('subscribe_game', function(room) {
        io.sockets.in(room).emit('update_players');
        socket.join(room);
        socket.room = room;
        console.log("Rooms when subcribe: " + JSON.stringify(io.sockets.manager.rooms));
    });

    //When a user confirm his participation to a game, info send {info: game_id}
    socket.on('game_confirmation_player', function() {
        io.sockets.in(socket.room).emit('update_players');
        console.log("Rooms when confirm: " + JSON.stringify(io.sockets.manager.rooms));
    });

    //When a user leave a game (it could be the room_admin),info send {info: game_id}
    socket.on('unsubscribe_game', function() {
        socket.leave(socket.room);
        io.sockets.in(socket.room).emit('leave_update_players');
        socket.room = null;
        console.log("Rooms when unsubcribe: " + JSON.stringify(io.sockets.manager.rooms));
    });

    //When room administrator expels a user from a game, info send {info1: game_id, info2: user_id}
    socket.on('expelled_player' , function(user_expelled) {
        io.sockets.in(socket.room).emit('inform_expelled_player', user_expelled);
        console.log("Rooms when player expelled: " + JSON.stringify(io.sockets.manager.rooms));
    });

    socket.on('start_game_sent', function (data) {
        io.sockets.in(socket.room).emit('start_game_received', {info: data.game_id});
    });



    socket.on('conquer_territory_sent', function(image, player_id) {
        //console.log(JSON.stringify(image));
        //console.log("player_id: " + player_id);
        io.sockets.in(socket.room).emit('conquer_territory_received', image, player_id);
    });

    socket.on('thief_sent', function(image) {
        io.sockets.in(socket.room).emit('thief_received', image);
    });

    socket.on('enable_dices_sent', function(data) {
        //console.log("rebut del servidor");
        io.sockets.in(socket.room).emit('enable_dices_received', {info: data.info});
    });

    socket.on('game_won_sent', function(data) {
        io.sockets.in(socket.room).emit('game_won_received', data);
    });



    socket.on('subscribe', function(room, username) {
        io.sockets.in(room).emit('userconnected', username);
        socket.emit('updatechat', 'SERVER', 'you have connected');
        socket.join(room);
        socket.username = username;
        socket.room = room;
    });

    socket.on('unsubscribe', function(room) {
        socket.leave(room);
        io.sockets.in(room).emit('userdisconnected', socket.username);
    });

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    // when the user disconnects... perform this
    socket.on('disconnect', function(){

        socket.leave(socket.room);

        // update list of users in chat, client-side
        io.sockets.in(socket.room).emit('userdisconnected', socket.username);
    });
});
