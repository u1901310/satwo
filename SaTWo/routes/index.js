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
            username: "admin",
            password: "abcd",
            email: "admin@mail.com"
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

exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log("Finded all users of application");
            res.send(items);
        });
    });
};

/*
 * USERS SERVER FUNCTIONS
 * */
exports.login = function(req, res) {
    var name = req.params.username;
    var pass = req.params.password;
    db.collection('users', function(err, collection) {
        collection.findOne({ 'username': name, 'password': pass}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " logged");
                res.send({'result': 'ok', '_id': item._id, 'username': item.username});
            } else {
                console.log("User " + name + " not found");
                res.send({'result': 'ko'});
            }
        });
    });
};

exports.findByUsername = function(req, res) {
    var name = req.params.username;
    db.collection('users', function(err, collection) {
        collection.findOne({ 'username': name}, function(err, item) {
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
        user_games_id: []
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
                    while(i < user.games_id.length) {
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