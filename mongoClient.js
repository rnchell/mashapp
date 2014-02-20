var mongo = require('mongodb'),
    url = require('url'),
    MongoClient = mongo.MongoClient;

var db;

exports.connect = function(){
    MongoClient.connect('mongodb://devuser:powerglove@ds033459.mongolab.com:33459/mashdev', function(err, mdb) {

      if(!err){
        console.log('connected to mashdev mongodb');
        db = mdb;
      } else{
        console.log('error connecting to mongodb: ' + err);
      }

    });
};

exports.close = function(){

};

exports.getById = function(req, res) {

    var id = req.params.id;

    console.log('Retrieving user: ' + id);

    db.collection('users', function(err, collection) {

        collection.findOne({'_id': id}, function(err, item) {

            res.send(item);

        });
    });
};
 
exports.getByIds = function(req, res){

};

exports.getAll = function(req, res) {

    db.collection('users', function(err, collection) {

        collection.find().toArray(function(err, items) {

            res.send(items);

        });
    });
};

exports.getFriends = function(req, res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    db.collection('users', function(err, collection){

        collection.find({ _id : { $in : query.ids } }).toArray(function(err, items){
            res.send(items.clean(null));
        });
    });
}

exports.addDate = function(req, res){
    console.log('Adding dates to users.');

    var ids = req.body.ids;
    var date = req.body.date;

    db.collection('users', function(err, collection) {
        collection.update({ _id : { $in : ids } },{ $addToSet: { dates: date }},{ multi: true }, function(err, result){
            console.log(result);
        });
    });

    res.end();
};

exports.addUser = function(req, res) {

    var user = { 
        _id: req.body._id, 
        name: req.body.name, 
        email: req.body.email,
        photo: req.body.photo,
        dates: [],
        status: 'Available'
    };

    console.log('Adding user: ' + JSON.stringify(user));

    db.collection('users', function(err, collection) {

        collection.insert(user, {safe:true}, function(err, result) {

            if (err) {
                res.send({'error':'An error has occurred'});

            } else {
                console.log('Success: ' + JSON.stringify(result[0]));

                res.send(result[0]);

            }
        });
    });

};
 
exports.updateUser = function(req, res) {

    var id = req.params.id;
    var user = req.body;

    console.log('Updating user: ' + id);

    console.log(JSON.stringify(user));

    db.collection('users', function(err, collection) {

        collection.update({'_id': id}, user, {safe:true}, function(err, result) {

            if (err) {
                console.log('Error updating user: ' + err);

                res.send({'error':'An error has occurred'});

            } else {
                console.log('' + result + ' document(s) updated');

                res.send(user);

            }
        });
    });

};
 
exports.deleteUser = function(req, res) {

    var id = req.params.id;

    console.log('Deleting user: ' + id);

    db.collection('users', function(err, collection) {

        collection.remove({'_id': id}, {safe:true}, function(err, result) {

            if (err) {
                res.send({'error':'An error has occurred - ' + err});

            } else {
                console.log('' + result + ' user deleted');

                res.send(req.body);

            }
        });
    });

};

exports.MongoClient = MongoClient;
exports.db = db;