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
            //if (err) {
                console.log("The 'users' collection doesn't exist. Creating it with sample data...");
                populateDB();
            //}
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

    var factions = [
        {
            faction_name: "Naturistes"
            //Altres atributs: imatge, bonus i dany
        },
        {
            faction_name: "Ultradretans"
        }];

    db.collection('factions', function(err, collection) {
       collection.insert(factions, {safe:true}, function(err, result) {});
    });

    var territories = [];
    for (var i = 0; i < 42; i++) {
        territories[i] = {
            territory_image: 'territory' + (i+1) + '.png',
            territory_size: Math.floor(Math.random()*3) + 2
        };
    }

    db.collection('territories', function(err, collection) {
        collection.insert(territories, {safe:true}, function(err, result) {});
    });
};

/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'SaTWo: Save the World' });
};*/

/* ---------------------------------------------------------------------------------------------------------------------------------------------
 *  ---------------------------------------------------------------------------------------------------------------------------------------------
 *       USER SERVER FUNCTIONS
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * */

// Function to login a user. It searches for the user in the collection 'users'
//  and return its information if it was found.
exports.login = function(req, res) {
    var name = req.params.username;
    var pass = req.params.password;
    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name, 'user_password': pass}, function(err, item) {
            if(item != null) {
                console.log('User ' + name + ' logged');
                res.send({result: 'ok', _id: item._id, user_username: item.user_username});
            } else {
                console.log('User ' + name + ' not found');
                res.send({result: 'ko'});
            }
        });
    });
};

// Function to find a user by its username. It is similar to login function,
//  but this function does not return the user information
exports.findByUsername = function(req, res) {
    var name = req.params.username;
    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name}, function(err, item) {
            if(item != null) {
                console.log('User ' + name + ' found');
                res.send({"result": "ok"});
            } else {
                console.log('User ' + name + ' not found');
                res.send({"result": "ko"});
            }
        });
    });
};

// Function to add a user to the database. It initializes the default attributes
//  and insert the new user into the 'users' collection.
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

// Function to send a friendship request to another user. By this way, the user
//  who sends the request is added to the friendship requests' list of the user
//  who receives it
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

// Function to reject a friendship request. It deletes a friendship request from
//  its list by giving the username of the friend.
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

// Function to add a friend to the friend's list. It adds the friend to the friend's
//  list of the user, it adds the user to the friend's list of the friend, and it
//  removes the friendship request of the friend from the friendship requests' list
//  of the user.
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

// Function to remove a friend from the friend's list. It removes the friend from
//  the user friend's list, and it removes the user from the friend friend's list.
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

// Function to get the set of requests from a certain user.
exports.getRequests = function(req, res) {
    var name = req.params.username;

    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name}, function(err, item) {
            if(item != null) {
                console.log('User ' + name + ' found');
                res.send({result: 'ok', requests: item.user_requests});
            } else {
                console.log('User ' + name + ' not found');
                res.send({result: 'ko'});
            }
        });
    });
};

// Function to get the set of friends of a certain user.
exports.getFriends = function(req, res) {
    var name = req.params.username;

    db.collection('users', function(err, collection) {
        collection.findOne({ 'user_username': name}, function(err, item) {
            if(item != null) {
                console.log('User ' + name + ' found');
                res.send({result: 'ok', friends: item.user_friends});
            } else {
                console.log('User ' + name + ' not found');
                res.send({result: 'ko'});
            }
        });
    });
};

/*
* SFunction to get users username
*  params: user_id
* */
exports.getUserUsername = function(req, res) {
  var user_id = req.params.user_id;

  console.log('Consulting user username of ' + user_id);
  db.collection('users', function(err, users) {
     users.findOne({_id: new BSON.ObjectID(user_id)}, function(err, user) {
         console.log('Result send: ' + user.user_username);
         res.send(user.user_username);
     });
  });
};

/* ---------------------------------------------------------------------------------------------------------------------------------------------
*  ---------------------------------------------------------------------------------------------------------------------------------------------
*       GAMES SERVER FUNCTIONS
* ----------------------------------------------------------------------------------------------------------------------------------------------
* ----------------------------------------------------------------------------------------------------------------------------------------------
* */
// Function to the get the games created by a certain user.
exports.findUserGames = function(req, res) {
    var userId = req.params.user_id;

    console.log('Listing all user games');
    db.collection('users', function(err, users_collection) {
        users_collection.findOne({ _id: new BSON.ObjectID(userId)}, function(err, user) {
            if(user != null) {
                db.collection('games', function(err, games_collection) {
                    var games_id_list = new Array();
                    var i = 0;
                    while(i < user.user_games_id.length) {
                        games_id_list[i] = new BSON.ObjectID(user.user_games_id[i]);
                        i = i + 1;
                    }
                    console.log(games_id_list);
                    games_collection.find({ _id: { $in: games_id_list}}).toArray(function(err, games){
                        if((games != null) && (games.length > 0)) {
                            console.log('Sending the games found ' + games);
                            res.send({'result': 'ok', 'games_list': games});
                        } else {
                            console.log('No games found');
                            res.send({'result': 'ko'});
                        }
                    });
                });
            } else {
                console.log('User with id ' + userId + ' not found');
                res.send({'result': 'ko'});
            }
        });
    });
};

// Function to get the set of public games created by all users.
exports.findPublicGames = function(req, res) {
    console.log('Listing all public games');
    db.collection('games', function(err, collection) {
        collection.find({ game_is_public: true}).toArray(function(err,games) {
            if((games != null) && (games.length > 0)) {
                console.log('Sending the games found ' + games);
                res.send({'result': 'ok', 'games_list': games});
            } else {
                console.log('No games found');
                res.send({'result': 'ko'});
            }
        });
    });
};

/*
* SFunction to add a new game to the application
*  params: (POST) name, password, n_players and user_creator
* */
exports.addGame = function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var num_players = req.body.n_players;
    var creator = req.body.user_creator;
    var game = {
        game_name: name,
        game_password: password,
        game_num_of_players: num_players,
        game_current_num_of_players: 1,
        game_is_public: true,
        game_room_administrator: creator,
        game_users_info: [{user_id: creator, confirmation: false, faction: null}], //La confirmació serveix per la gestio de la sala de espera
        game_players: [],
        game_territories: [],
        game_turn: 1,
        game_round: 1
        //Altres atributs necessaris per defecte
    };

    console.log('Adding game: ' + JSON.stringify(game));
    db.collection('games', function(err, collection) {
        collection.insert(game, {safe:true}, function(err, result){
            if(err) {
                res.send({'error':'An error has ocurred adding new game'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

/*
 * SFunction to initialize the info of the players and the territories when the game starts
 *  params: (POST) id
 * */
exports.initGame = function(req, res) {
    var game_id = req.body.id;

    console.log('Initializing game (id): ' + game_id);

    var territories_num;
    db.collection('territories', function(err, territories) {
        territories_num = territories.length;
    });

    db.collection('games', function(err, games) {
        games.findOne({ _id: new BSON.ObjectID(game_id)}, function(err, game) {
            for (var i = 0; i < game.game_num_of_players; i++) {
                games.update({ _id: new BSON.ObjectID(game_id)}, { $push:
                    {
                        game_players:
                        {
                            player_user_id: game.game_users_info[i].user_id,
                            player_id: i+1,
                            player_faction: game.game_users_info[i].faction,
                            player_weapons: {weapon_level_1: 0, weapon_level_2: 0, weapon_level_3: 0},
                            player_cards: [],
                            player_resources: {brick: 0, lumber: 0, ore: 0, wool: 0, grain: 0}
                        }
                    }}, function(err, result) {
                        if(err) {
                            res.send({ error: 'An error has occurred initializing the game'});
                        } else {
                            //console.log('Success: Game initialized');
                        }
                });
            }

            var territory_random_numbers = [2,2,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6,8,8,8,8,8,8,9,9,9,9,9,10,10,10,10,10,11,11,11,12,12];
            var position;
            var max_resources = 0;
            var resource_limit;
            var resource_counters = [0, 0, 0, 0, 0];
            var territory_resources;

            var game_territories = [];

            db.collection('territories', function(err, territories) {
                territories.find().toArray(function(err, items) {
                    // Comptem el nombre de recursos totals sumant el nombre de recursos de cada territori
                    for (var i = 0; i < items.length; i++) {
                        max_resources = max_resources + items[i].territory_size;
                    };

                    // Trobem el limit total de cada recurs en el joc (un 20% més del que li tocaria per ser exactes)
                    resource_limit = Math.floor((max_resources/5)*1.2);

                    for (var i = 0; i < items.length; i++) {
                        // Generem un valor aleatori corresponent a una posicio de l'array 'territory_random_numbers'
                        position = Math.floor(Math.random()*territory_random_numbers.length);

                        // Generem els recursos del territori, sempre que el nombre total d'un recurs no superi el limit
                        territory_resources = generateTerritoryResources(resource_counters, resource_limit, items[i].territory_size);

                        game_territories[i] = {
                            territory_id: items[i]._id,
                            territory_random_number: territory_random_numbers[position],
                            territory_resources: territory_resources,
                            territory_ruler: null,
                            territory_level: 1,
                            territory_thief: false
                        };

                        // Eliminem el valor de la posició 'position' de 'territory_random_numbers' (n'eliminem '1')
                        territory_random_numbers.splice(position, 1);

                        // Actualitzem el nombre total de cada recurs
                        for (var j = 0; j < 5; j++) resource_counters[j] = resource_counters[j] + territory_resources[j];
                    };

                    games.update({ _id: new BSON.ObjectID(game_id)}, { $pushAll: {game_territories: game_territories}}, function(err, result) {
                        if(err) {
                            res.send({ error: 'An error has occurred initializing the game'});
                        } else {
                            console.log('Success: Game initialized');
                            res.send(null);
                        }
                    });
                })
            });
        });
    });
};

/*
 * IFunction to generate random territory resources
 * return: territory_resources
 */
function generateTerritoryResources(resource_counters, resource_limit, territory_size) {
    var territory_resources = [0, 0, 0, 0, 0];
    var value;
    var i = 0;
    while (i < territory_size) {
        value = Math.floor(Math.random()*5);
        if (resource_counters[value] < resource_limit) {
            territory_resources[value] = territory_resources[value] + 1;
            i = i + 1;
        }
    }

    return territory_resources;
}

/*
* SFunction to link a user with a game
*  params: (POST) user_id and game_id
*/
exports.addGameToUser = function(req, res) {
    var user_id = req.body.user;
    var game_id = req.body.game;

    console.log('Adding game: ' + game_id + ' to user: ' + user_id);
    db.collection('users', function(err, users) {
        users.update({ _id: new BSON.ObjectID(user_id)}, {$addToSet: {user_games_id: game_id}}, function(err, result) {
            if(err) {
                res.send({error: 'An error has ocurred adding a game to user'});
            } else {
                console.log('Success: game ' + game_id + ' added to user ' + user_id);
                res.send(null);
            }
        });
    });
};

/*
* SFunction to create a bidirectional link between an user and a game
*  params: (POST) user_id and game_id
* */
exports.linkGameAndUser = function(req, res) {
    var user_id = req.body.user;
    var game_id = req.body.game;

    console.log('Adding game: ' + game_id + ' to user: ' + user_id);
    db.collection('users', function(err, users) {
        users.update({ _id: new BSON.ObjectID(user_id)}, {$addToSet: {user_games_id: game_id}}, function(err, result) {
            if(err) {
                res.send({error: 'An error has ocurred adding a game to user'});
            } else {
                console.log('Success: game ' + game_id + ' added to user ' + user_id);
            }
        });
    });

    db.collection('games', function(err, games) {
       games.findOne({ _id: new BSON.ObjectID(game_id)}, function(err, game) {
           console.log('Adding user: ' + user_id + ' to game: ' + game_id);
           games.update({ _id: new BSON.ObjectID(game_id)}, {$addToSet: {game_users_info: {user_id: user_id, confirmation: false, faction: null}}}, function(err, result) {
               if(err) {
                   res.send({error: 'An error has ocurred adding a user to game'});
               } else {
                   console.log('Success: user ' + user_id + ' added to game ' + game_id);
               }
           });
           console.log('Incrementing the current number of players of game: ' + game_id);
           games.update({ _id: new BSON.ObjectID(game_id)}, { $set: { game_current_num_of_players: game.game_current_num_of_players + 1}}, function(err, result) {
               if(err) {
                   res.send({ error: 'An error has ocurred incrementing the current number of players of the game'});
               } else {
                   res.send(null);
               }
           });
       });
    });
};

/*
 * SFunction to destroy the bidirectional link between an user and a game
 *  params: (POST) user_id and game_id
 * */
exports.unlinkGameAndUser = function(req, res) {
    var user_id = req.body.user_id;
    var game_id = req.body.game_id;

    console.log('Deleting game: ' + game_id + ' from user: ' + user_id);
    db.collection('users', function(err, users) {
        users.update({ _id: new BSON.ObjectID(user_id)}, {$pull: {user_games_id: game_id}}, function(err, result) {
            if(err) {
                res.send({error: 'An error has ocurred deleting a game from user'});
            } else {
                console.log('Success: game ' + game_id + ' deleted from user ' + user_id);
            }
        });
    });

    db.collection('games', function(err, games) {
        games.findOne({ _id: new BSON.ObjectID(game_id)}, function(err, game) {
            console.log('Decrementing the current number of players of game: ' + game_id);
            games.update({ _id: new BSON.ObjectID(game_id)}, { $set: { game_current_num_of_players: game.game_current_num_of_players - 1}}, function(err, result) {
                if(err) {
                    res.send({ error: 'An error has ocurred decrementing the current number of players of the game'});
                } else {
                    console.log('Success: Current number of players decremented');
                }
            });

            if(game.game_current_num_of_players == 1) { //Per no reconsultar el joc, comprovem si era l'ultim jugador
                //There's no player in the game so it's over
                console.log('The game has no players, so let\'s kill it');
                games.remove({_id: new BSON.ObjectID(game_id)});
                //!!!!!!!!!!!!!!!!! Cal repintar tots els llistats de jocs publics per evitar errors !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                res.send(null);
            } else {
                console.log('Deleting user: ' + user_id + ' from game: ' + game_id);
                games.update({ _id: new BSON.ObjectID(game_id)}, {$pull: {game_users_info: {user_id: user_id}}}, function(err, result) {
                    if(err) {
                        res.send({error: 'An error has ocurred deleting a user to game'});
                    } else {
                        //Still there some players so check if new room administrator is needed
                        console.log('Success: user ' + user_id + ' deleted from game ' + game_id);
                        if(game.game_room_administrator == user_id) {
                            console.log('Assigning a new room administrator to the game');
                            var new_room_administrator = game.game_users_info[1].user_id; //Per no reconsultar el joc, agafem el de la posicio 1
                            games.update({_id: new BSON.ObjectID(game_id)}, {$set: {game_room_administrator: new_room_administrator}}, function(err, result) {
                                if(err) {
                                    res.send({error: 'An error has ocurred assigning a new room administrator'});
                                } else {
                                    console.log('Success: the new room administrator is user: ' + new_room_administrator);
                                    res.send(null);
                                }
                            });
                        } else {
                            res.send(null);
                        }
                    }
                });
            }
        });
    });
    res.send(null);
};

/*
 * SFunction to check if a game is full or not
 *  params: game_id
 * */
exports.gameIsFull = function(req, res) {
    var game_id = req.params.game_id;

    console.log('Checking if game ' + game_id + ' is full');
    db.collection('games', function(err, games) {
        games.findOne({_id: new BSON.ObjectID(game_id)}, function(err, game) {
            if(game.game_current_num_of_players < game.game_num_of_players) {
                console.log('The game is NOT full');
                res.send({result: 'no'});
            } else {
                console.log('The game is full');
                res.send({result: 'yes'});
            }
        });
    });
};

/*
* SFunction to check if a game have password or not
*  params: game_id
* */
exports.gameIsSecure = function(req, res) {
    var game_id = req.params.game_id;

    console.log('Checking if game ' + game_id + ' has password');
    db.collection('games', function(err, games) {
        games.findOne({_id: new BSON.ObjectID(game_id)}, function(err, game) {
            if(game.game_password != "") {
                console.log('The game has password');
                res.send({result: 'yes'});
            } else {
                console.log('The game has no password');
                res.send({result: 'no'});
            }
        });
    });
};

/*
* SFunction to validate the password of a game
*  params: (POST) game_id and validation_password
* */
exports.validateGamePassword = function(req, res) {
    var game_id = req.body.game_id;
    var password = req.body.validation_password;

    console.log('Validation the password ' + password + ' with the game ' + game_id);
    db.collection('games', function(err, games) {
        games.findOne({_id: new BSON.ObjectID(game_id), game_password: password}, function(err, game) {
            if(game != null) {
                console.log('Correct password');
                res.send({result: 'ok'});
            } else {
                console.log('Wrong password');
                res.send({result: 'ko'});
            }
        });
    });
};

/*
* SFunction to get a game object
*  params: game_id
* */
exports.getGame = function(req, res) {
  var game_id = req.params.game_id;

  console.log('Get game with id: ' + game_id);
  db.collection('games', function(err, games) {
    games.findOne({_id: new BSON.ObjectID(game_id)}, function(err, game) {
        res.send(game);
    });
  });
};

/*
* SFunction to advice that a user confirm his participation to a game
*  params: (POST) user_id, game_id and user_faction
* */
exports.confirmUserToGame = function(req, res) {
  var user_id = req.body.user_id;
  var user_faction = req.body.user_faction;
  var game_id = req.body.game_id;

  console.log('Confirming the participation of user ' + user_id + ' to the game ' + game_id);
  db.collection('games', function(err, games) {
      games.update({_id: new BSON.ObjectID(game_id), "game_users_info.user_id": user_id}, {$set: {"game_users_info.$.confirmation": true, "game_users_info.$.faction": user_faction}}, function(err, result) {
          if(err) {
              res.send({error: 'An error has ocurred confirming a user to game'});
          } else {
              console.log('Success: user ' + user_id + ' confirmed to game ' + game_id);
              res.send(null);
          }
      });
  });
};

/*
 * SFunction to get the turn of a game
 *  params: game_id
 * */
exports.getGameTurn = function(req, res) {
    var game_id = req.params.game_id;

    console.log('Get turn of the game with id: ' + game_id);
    db.collection('games', function(err, games) {
        games.findOne({_id: new BSON.ObjectID(game_id)}, function(err, game) {
            res.send(game.game_turn);
        });
    });
};

/*
 * SFunction to set the turn of a game
 *  params: (POST) game_id and turn
 */
exports.setGameTurn = function(req, res) {
    var game_id = req.body.game_id;
    var turn = req.body.turn;

    console.log('Setting turn ' + turn + ' to game ' + game_id);
    db.collection('games', function(err, games) {
        games.update({ _id: new BSON.ObjectID(game_id)}, {$set: {game_turn: turn}}, function(err, result) {
            if(err) {
                res.send({error: 'An error has occurred setting the turn of a game'});
            } else {
                console.log('Success: turn ' + turn + ' set to game ' + game_id);
                res.send(null);
            }
        });
    });
};

/*
 * SFunction to get the round of a game
 *  params: game_id
 * */
exports.getGameRound = function(req, res) {
    var game_id = req.params.game_id;

    console.log('Get round of the game with id: ' + game_id);
    db.collection('games', function(err, games) {
        games.findOne({_id: new BSON.ObjectID(game_id)}, function(err, game) {
            res.send(game.game_round);
        });
    });
};

/*
 * SFunction to set the round of a game
 *  params: (POST) game_id and round
 */
exports.setGameRound = function(req, res) {
    var game_id = req.body.game_id;
    var round = req.body.round;

    console.log('Setting round ' + round + ' to game ' + game_id);
    db.collection('games', function(err, games) {
        games.update({ _id: new BSON.ObjectID(game_id)}, {$set: {game_round: round}}, function(err, result) {
            if(err) {
                res.send({error: 'An error has occurred setting the round of a game'});
            } else {
                console.log('Success: round ' + round + ' set to game ' + game_id);
                res.send(null);
            }
        });
    });
};

/*
 * SFunction to set the territory's ruler of a game
 *  params: (POST) game_id, territory_id and player_id
 */
exports.setTerritoryRuler = function(req, res) {
    var game_id = req.body.game_id;
    var territory_id = req.body.territory_id;
    var player_id = req.body.player_id;

    console.log('Setting ruler ' + player_id + ' to territory ' + territory_id + ' for game ' + game_id);
    db.collection('games', function(err, games) {
        games.update({_id: new BSON.ObjectID(game_id), "game_territories.territory_id": new BSON.ObjectID(territory_id)}, {$set: {"game_territories.$.territory_ruler": player_id}}, function(err, result) {
            if(err) {
                res.send({error: 'An error has occurred setting the ruler on a territory'});
            } else {
                console.log('Success: player ' + player_id + ' set to ruler of territory ' + territory_id + ' for game ' + game_id);
                res.send(null);
            }
        });
    });
};


/* ---------------------------------------------------------------------------------------------------------------------------------------------
 *  ---------------------------------------------------------------------------------------------------------------------------------------------
 *       FACTIONS SERVER FUNCTIONS
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * */
exports.getFactions = function(req, res) {
    db.collection('factions', function(err, factions) {
        factions.find().toArray(function(err, items) {
            console.log('Found all factions of application');
            res.send(items);
        });
    });
};


/* ---------------------------------------------------------------------------------------------------------------------------------------------
 *  ---------------------------------------------------------------------------------------------------------------------------------------------
 *       TERRITORIES SERVER FUNCTIONS
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * */
exports.getTerritories = function(req, res) {
    db.collection('territories', function(err, territories) {
        territories.find().toArray(function(err, items) {
            console.log('Found all territories of application');
            res.send(items);
        });
    });
};


/* ---------------------------------------------------------------------------------------------------------------------------------------------
 *  ---------------------------------------------------------------------------------------------------------------------------------------------
 *       ADMINISTRATION SERVER FUNCTIONS
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * ----------------------------------------------------------------------------------------------------------------------------------------------
 * */
exports.clearAll = function(req, res) {
    console.log('Deleting all users');
    db.collection('users', function(err, collection) {
        collection.drop();
    });
    console.log('Deleting all games')
    db.collection('games', function(err, collection) {
        collection.drop();
    });
    console.log('Deleting all factions');
    db.collection('factions', function(err, collection) {
        collection.drop();
    });
    console.log('Deleting all territories');
    db.collection('territories', function(err, collection) {
        collection.drop();
        res.send('all erased');
    });
};

// Function to clear all users from the database.
exports.clearAllUsers = function(req, res) {
    console.log('Deleting all users');
    db.collection('users', function(err, collection) {
        collection.drop();
        res.send('All user erased');
    });
};

// Function to clear all public games from the database.
exports.clearAllGames = function(req, res) {
    console.log('Deleting all games');
    db.collection('games', function(err, collection) {
       collection.drop();
        res.send('all games erased');
    });
};

exports.clearAllFactions = function(req, res) {
    console.log('Deleting all factions');
    db.collection('factions', function(err, collection) {
        collection.drop();
        res.send('all factions erased');
    });
};

// Function to get all public games from the database.
exports.findAllGames = function(req, res) {
    db.collection('games', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log('Found all games of application');
            res.send(items);
        });
    });
};

// Function to get all users from the database.
exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log('Found all users of application');
            res.send(items);
        });
    });
};