/*
 * Acces to the Database and datamanagement functions
 * */
var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('adadb', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'adadb' database");
        db.collection('users', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'users' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

//Function to initialize the database
var populateDB = function() {

    var users = [
        {
            user_username: "Pau",
            user_password: "Pau1234",
            user_email: "pau@mail.cat",
            user_games_id: [],
            user_requests: [],
            user_friends: []
        },
        {
            user_username: "Edu",
            user_password: "Edu1234",
            user_email: "edu@mail.cat",
            user_games_id: [],
            user_requests: [],
            user_friends: []
        },
        {
            user_username: "Pep",
            user_password: "Pep1234",
            user_email: "pep@mail.cat",
            user_games_id: [],
            user_requests: [],
            user_friends: []
        },
        {
            user_username: "Pol",
            user_password: "Pol1234",
            user_email: "pol@mail.cat",
            user_games_id: [],
            user_requests: [],
            user_friends: []
        }];

    db.collection('users', function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {});
    });
};

/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'SaTWo: Save the World' });
};*/

/*
 * USERS SERVER FUNCTIONS
 * */
exports.login = function(req, res) {
    var name = req.params.username;
    var pass = req.params.password;
    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name, 'user_password': pass}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " logged");
                res.send({result: 'ok', _id: item._id, user_username: item.user_username});
            } else {
                console.log("User " + name + " not found");
                res.send({result: 'ko'});
            }
        });
    });
};

exports.findByUsername = function(req, res) {
    var name = req.params.username;
    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " found");
                res.send({"result": "ok"});
            } else {
                console.log("User " + name + " not found");
                res.send({"result": "ko"});
            }
        });
    });
};

exports.addUser = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var user = {
        user_username: username,
        user_password: password,
        user_email: email,
        user_games_id: [],
        user_requests: [],
        user_friends: []
        //Altres atributs necessaris per defecte
    };

    console.log('Adding user: ' + JSON.stringify(user));
    db.collection('users', function(err, collection) {
        collection.insert(user, {safe:true}, function(err, result){
            if(err) {
                res.send({'error':'An error has ocurred adding new user'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.sendRequest = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Sending friendship request from user ' + friend + ' to user ' + user);
    db.collection('users', function(err, collection) {
        collection.update({user_username: friend}, {$addToSet: {user_requests: user}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred sending a request'});
            } else {
                console.log('Success: user ' + user + ' added to user ' + friend + ' requests');
                res.send(null);
            }
        });
    });
};

exports.rejectRequest = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Removing request from user ' + friend + ' sent to user ' + user);
    db.collection('users', function(err, collection) {
        collection.update({user_username: user}, {$pull: {user_requests: friend}}, function(err, result) {
            if (err) {
                res.send({'error':'An error occurred removing a request'});
            } else {
                console.log('Success: request from user ' + friend + ' removed from user ' + user);
                res.send(null);
            }
        });
    });
};

exports.addFriend = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Adding friend ' + friend + ' to user ' + user + ' and vice versa');
    db.collection('users', function(err, collection) {
        collection.update({user_username: user}, {$addToSet: {user_friends: friend}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred adding a new friend'});
            } else {
                console.log('Success: user ' + friend + ' added to user ' + user + ' as a friend');
            }
        });

        collection.update({user_username: friend}, {$addToSet: {user_friends: user}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred adding a new friend'});
            } else {
                console.log('Success: user ' + user + ' added to user ' + friend + ' as a friend');
            }
        });

        console.log('Removing request from user ' + friend + ' sent to user ' + user);
        collection.update({user_username: user}, {$pull: {user_requests: friend}}, function(err, result) {
            if (err) {
                res.send({'error':'An error occurred removing a request'});
            } else {
                console.log('Success: request from user ' + friend + ' removed from user ' + user);
                res.send(null);
            }
        });
    });
};

exports.removeFriend = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Removing friend ' + friend + ' from user ' + user + ' and vice versa');
    db.collection('users', function(err, collection) {
        collection.update({user_username: user}, {$pull: {user_friends: friend}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred removing an existing friend'});
            } else {
                console.log('Success: user ' + friend + ' removed from user ' + user + ' as a friend');
            }
        });

        collection.update({user_username: friend}, {$pull: {user_friends: user}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred removing an existing friend'});
            } else {
                console.log('Success: user ' + user + ' removed from user ' + friend + ' as a friend');
                res.send(null);
            }
        });
    });
};

exports.getRequests = function(req, res) {
    var name = req.params.username;

    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " found");
                res.send({result: 'ok', requests: item.user_requests});
            } else {
                console.log("User " + name + " not found");
                res.send({result: 'ko'});
            }
        });
    });
};

exports.getFriends = function(req, res) {
    var name = req.params.username;

    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " found");
                res.send({result: 'ok', friends: item.user_friends});
            } else {
                console.log("User " + name + " not found");
                res.send({result: 'ko'});
            }
        });
    });
};

/*
* GAMES SERVER FUNCTIONS
* */
exports.findUserGames = function(req, res) {
    var userId = req.params.user_id;

    console.log("Listing all user games");
    db.collection('users', function(err, collection) {
        collection.findOne({ _id: new BSON.ObjectID(userId)}, function(err, user) {
            if(user != null) {
                db.collection('games', function(err, collection2) {
                    // Comprovar si aixo esta be
                    var games_id_list = new Array();
                    var i = 0;
                    while(i < user.user_games_id.length) {
                        games_id_list[i] = new BSON.ObjectID(user.games_id[i]);
                    }
                    //---------------------------------------------------
                    console.log(games_id_list);
                    collection2.find({ _id: { $in: games_id_list}}).toArray(function(err, games){
                        if((games != null) && (games.length > 0)) {
                            console.log("Sending the games found " + games);
                            res.send({'result': 'ok', 'games_list': games});
                        } else {
                            console.log("No games found");
                            res.send({'result': 'ko'});
                        }
                    });
                });
            } else {
                console.log("User with id " + userId + " not found");
                res.send({'result': 'ko'});
            }
        });
    });
};

exports.findPublicGames = function(req, res) {
    console.log("Listing all public games");
    db.collection('games', function(err, collection) {
        collection.find({ game_is_public: true}).toArray(function(err,games) {
            if((games != null) && (games.length > 0)) {
                console.log("Sending the games found " + games);
                res.send({'result': 'ok', 'games_list': games});
            } else {
                console.log("No games found");
                res.send({'result': 'ko'});
            }
        });
    });
};

exports.addGame = function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var num_players = req.body.n_players;
    var game = {
        game_name: name,
        game_password: password,
        game_num_of_players: num_players,
        game_current_num_of_players: 1,
        game_is_public: true,
        game_users_id: []
        //Altres atributs necessaris per defecte
    };

    console.log('Adding game: ' + JSON.stringify(game));
    db.collection('games', function(err, collection) {
        collection.insert(game, {safe:true}, function(err, result){
            if(err) {
                res.send({'error':'An error has ocurred adding new game'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result._id);
            }
        });
    });
};

/*
* ADMINISTRATION FUNCTIONS
* */
exports.clearAllUsers = function(req, res) {
    console.log('Deleting all users');
    db.collection('users', function(err, collection) {
        collection.drop();
        res.send({});
    });
};

exports.clearAllGames = function(req, res) {
    console.log('Deleting all games');
    db.collection('games', function(err, collection) {
       collection.drop();
        res.send({});
    });
};

exports.findAllGames = function(req, res) {
    db.collection('games', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log("Finded all games of application");
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log("Finded all users of application");
            res.send(items);
        });
    });
};