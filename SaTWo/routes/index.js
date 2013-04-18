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
            } else {
                populateDB();
            }
        });
    }
});

//Function to initialize the database
var populateDB = function() {

    var users = [
        {
            username: "Pau",
            password: "Pau1234",
            email: "pau@mail.cat",
            requests: [],
            friends: []
        },
        {
            username: "Edu",
            password: "Edu1234",
            email: "edu@mail.cat",
            requests: [],
            friends: []
        },
        {
            username: "Pep",
            password: "Pep1234",
            email: "pep@mail.cat",
            requests: [],
            friends: []
        },
        {
            username: "Pol",
            password: "Pol1234",
            email: "pol@mail.cat",
            requests: [],
            friends: []
        }];

    db.collection('users', function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {});
    });
};

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'SaTWo: Save the World' });
};

exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log("Found all users of application");
            res.send(items);
        });
    });
};

exports.login = function(req, res) {
    var name = req.params.username;
    var pass = req.params.password;
    db.collection('users', function(err, collection) {
        collection.findOne({ 'username': name, 'password': pass}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " logged");
                res.send(item);
            } else {
                console.log("User " + name + " not found");
                res.send(null);
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
        username: username,
        password: password,
        email: email,
        requests: [],
        friends: []
        //Altres atributs necessaris per defecte
    };

    console.log('Adding user: ' + JSON.stringify(user));
    db.collection('users', function(err, collection) {
        collection.insert(user, {safe:true}, function(err, result){
            if(err) {
                res.send({'error':'An error has occurred adding new user'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.sendRequest = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Sending friendship request from user ' + friend + ' to user ' + user);
    db.collection('users', function(err, collection) {
        collection.update({username: friend}, {$addToSet: {requests: user}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred sending a request'});
            } else {
                console.log('Success: user ' + user + ' added to user ' + friend + ' requests');
                res.send(null);
            }
        });
    });
}

exports.rejectRequest = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Removing request from user ' + friend + ' sent to user ' + user);
    db.collection('users', function(err, collection) {
        collection.update({username: user}, {$pull: {requests: friend}}, function(err, result) {
            if (err) {
                res.send({'error':'An error occurred removing a request'});
            } else {
                console.log('Success: request from user ' + friend + ' removed from user ' + user);
                res.send(null);
            }
        });
    });
}

exports.addFriend = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Adding friend ' + friend + ' to user ' + user + ' and vice versa');
    db.collection('users', function(err, collection) {
        collection.update({username: user}, {$addToSet: {friends: friend}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred adding a new friend'});
            } else {
                console.log('Success: user ' + friend + ' added to user ' + user + ' as a friend');
            }
        });

        collection.update({username: friend}, {$addToSet: {friends: user}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred adding a new friend'});
            } else {
                console.log('Success: user ' + user + ' added to user ' + friend + ' as a friend');
            }
        });

        console.log('Removing request from user ' + friend + ' sent to user ' + user);
        collection.update({username: user}, {$pull: {requests: friend}}, function(err, result) {
            if (err) {
                res.send({'error':'An error occurred removing a request'});
            } else {
                console.log('Success: request from user ' + friend + ' removed from user ' + user);
                res.send(null);
            }
        });
    });
}

exports.removeFriend = function(req, res) {
    var user = req.body.user;
    var friend = req.body.friend;

    console.log('Removing friend ' + friend + ' from user ' + user + ' and vice versa');
    db.collection('users', function(err, collection) {
        collection.update({username: user}, {$pull: {friends: friend}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred removing an existing friend'});
            } else {
                console.log('Success: user ' + friend + ' removed from user ' + user + ' as a friend');
            }
        });

        collection.update({username: friend}, {$pull: {friends: user}}, function(err, result){
            if (err) {
                res.send({'error':'An error has occurred removing an existing friend'});
            } else {
                console.log('Success: user ' + user + ' removed from user ' + friend + ' as a friend');
                res.send(null);
            }
        });
    });
}

exports.getRequests = function(req, res) {
    var name = req.params.username;

    db.collection('users', function(err, collection) {
        collection.findOne({ 'username': name}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " found");
                res.send({"requests": item.requests});
            } else {
                console.log("User " + name + " not found");
                res.send({"requests": null});
            }
        });
    });
}

exports.getFriends = function(req, res) {
    var name = req.params.username;

    db.collection('users', function(err, collection) {
        collection.findOne({ 'username': name}, function(err, item) {
            if(item != null) {
                console.log("User " + name + " found");
                res.send({"friends": item.friends});
            } else {
                console.log("User " + name + " not found");
                res.send({"friends": null});
            }
        });
    });
}

exports.removeUsers = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.remove();
        res.send(null);
    });
}