var mongo = require('mongodb'),
    url = require('url'),
    MongoClient = mongo.MongoClient,
    _ = require('./public/lib/underscore'),
    moment = require('./public/lib/moment'),
    ObjectID = require('mongodb').ObjectID,
    mailClient = require('./mailclient')

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
    mailClient.close();
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

exports.getDates = function(req, res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    var date_ids = [];

    if(!Array.isArray(query.ids)){
        date_ids.push(new ObjectID(query.ids));
    } else{
        date_ids = _.map(query.ids, function(id){
             return ObjectID(id);
        });
    }

    db.collection('dates', function(err, collection){

        collection.find({ _id : { $in : date_ids } }).toArray(function(err, dates){
            res.send(dates);
        });
    });
}

exports.addDate = function(req, res){
    console.log('Adding dates to users.');

    var ids = req.body.ids;
    var date = req.body.date;
    date.created = moment().utc().format();

    db.collection('dates', function(err, datesCollection){

        datesCollection.insert(date, {safe: true}, function(err, result){

            if(!err){
                db.collection('users', function(err, userCollection) {
                    userCollection.update({ _id : { $in : ids } },{ $addToSet: { dates: result[0]._id }},{ multi: true }, function(err, result){
                        if(err){
                            console.log('Error adding date to user: ' + err);
                        } else {
                            res.end('success');
                        }
                    });
                });
            }else{
                console.log('Error adding new date: ' + err);
            }
        });
    });
};

exports.addUser = function(req, res) {

    var user = { 
        _id: req.body._id, 
        name: req.body.name, 
        email: req.body.email,
        photo: req.body.photo,
        dates: [],
        status: 'available'
    };

    console.log('Adding user: ' + JSON.stringify(user));

    db.collection('users', function(err, collection) {

        collection.insert(user, {safe:true}, function(err, result) {

            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                mailClient.sendNewUserEmail(user);
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