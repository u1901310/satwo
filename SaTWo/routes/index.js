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

exports.index = function(req, res){
  res.render('index', { title: 'SaTWo: Save the World' });
};

exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log("Finded all users of application");
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
        email: email
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
}