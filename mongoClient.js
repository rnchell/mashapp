var mongo = require('mongodb'),
    url = require('url'),
    MongoClient = mongo.MongoClient,
    _ = require('./public/lib/underscore'),
    moment = require('./public/lib/moment'),
    ObjectID = require('mongodb').ObjectID,
    mailClient = require('./mailclient'),
    config = require('./config').config,
    ejs = require('ejs'),
    fs = require('fs'),
    paypal = require('./paypal')

var db;

exports.authorizePreapprovalTransaction = function(req, res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log('UPDATING PREAPPROVAL TRANSACTION: ' + query.date_id);
    // update transaction in mongodb by approvalId and set status to 'approved'
    // if update successful, create date and return to home

    db.collection('transactions', function(err, collection) {

        collection.update({'date_id': query.date_id}, { $set: { is_approved: true }}, {safe:true}, function(err, result) {

            if (err) {
                console.log('Error updating transaction: ' + err);

                //res.send({'error':'An error has occurred'});

            } else {
                console.log('' + result + ' tranaction(s) updated');

                //res.send('' + result);

            }
        });
    });

    res.writeHead(301,
      {Location: "http://localhost:5000/"}
    );

    res.end('');
};

exports.connect = function(){

    console.log('trying to connect to mongo...');

    MongoClient.connect(config.DATABASE_URI, function(err, mdb) {

      if(!err){
        console.log('connected to mashdev mongodb');
        db = mdb;
      } else{
        console.log('error connecting to mongodb: ' + err);
      }

    });
};

exports.close = function() {
    
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
    //var url_parts = url.parse(req.url, true);
    //var query = url_parts.query;
    var ids = req.body.ids;

    db.collection('users', function(err, collection){

        collection.find({ _id : { $in : ids } }).sort({ name: 1 }).toArray(function(err, items){

            if(err){
                console.log('Error getting user friends: ' + err);
            } else {
                res.send(items.clean(null));
            }

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
    date.acceptedCount = parseInt(date.acceptedCount);

    db.collection('dates', function(err, datesCollection){

        datesCollection.insert(date, {safe: true}, function(err, result){

            if(!err){

                console.log(result);
                res.end(JSON.stringify(result[0]));

                db.collection('users', function(err, userCollection) {

                    userCollection.update({ _id : { $in : ids } },{ $addToSet: { dates: result[0]._id }},{ multi: true }, function(err, result){
                        if(err){
                            console.log('Error adding date to user: ' + err);
                        } else {

                            fs.readFile(__dirname + '/public/templates/NewDateProposalEmailTemplate.html', 'utf-8', function(err, html) {
                                if(!err) {
                                    mailClient.sendDateProposalEmail(date, html);
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });
            }else{
                console.log('Error adding new date: ' + err);
                res.end('404');
            }
        });
    });
};

exports.updateProposedDate = function(req, res){

    var user_id = req.body.user_id;
    var date_id = req.body.date_id;

    var modified_date;

    db.collection('dates').findAndModify({_id: ObjectID(date_id)}, [['_id','asc']], {$inc: { acceptedCount: 1}}, {new: true, safe: true}, function(err, date) {
        if (err) {
            console.warn(err.message);
            res.end(err.message);
        } else{

            modified_date = date;
            
            // remove from user and end response
            db.collection('users', function(err, usersCollection){

                usersCollection.update({ _id : user_id },{ $pull: { dates: ObjectID(date_id) }}, function(err, result){

                    if (err) {
                        console.log('Error removing dates from user: ' + err);

                        res.end('Error: ' + err);
                    } else {
                        console.log('' + result + ' document(s) updated');
                        res.end('Success');
                    }

                });
            });
            // can do the rest async without notifying the client
            if(modified_date.acceptedCount >= 2){
                // date was accepted by both participants
                // maybe log somewhere?

                // if there is an amount on the date (or entry in transactions table)
                // if(modified_date.approval_transaction_id){
                //     console.log("APPROVAL TRANSACTION ID: " + modified_date.approval_transaction_id);

                //     db.collection('transactions', function(err, collection) {

                //         collection.findOne({'_id': modified_date.approval_transaction_id, 'is_approved': true}, function(err, item) {
                //             console.log('FOUND TRANSACTION TO RUN');

                //             paypal.sendPayments(item.paypal_approval_id, item.amount, modified_date.matchmaker.email, modified_date.participants[0].email, modified_date.participants[1].email);

                //         });
                //     });
                // }

                db.collection('dates').remove({_id: modified_date._id}, {safe:true}, function(err, result){
                    if(err){
                        console.log('Error removing date: ' + err);
                    } else{
                        console.log(result);
                        res.end(JSON.stringify(result));
                    }
                });

                fs.readFile(__dirname + '/public/templates/DateEmailTemplate.html', 'utf-8', function(err, html) {
                    if(!err) {
                        mailClient.sendDateAcceptedEmail(modified_date, html);
                    } else {
                        console.log(err);
                    }
                });
            } else {

                res.end(JSON.stringify(modified_date));
            }
        } 
    });
}

exports.deleteDate = function(req, res){
    
    res.end('');
}

exports.rejectProposedDate = function(req, res){
    
    console.log('Rejecting proposed date');

    var user_id = req.body.id;
    var date = req.body.date;

    console.log('Rejecting: ' + JSON.stringify(date));

    var rejectee = _.find(date.participants, function(u){ return u._id != user_id; });
    var rejector = _.find(date.participants, function(u){ return u._id == user_id; });

    var ids = _.map(date.participants, function(u){ return u._id;});

    if(date.acceptedCount == 1){
        // send rejection email
        fs.readFile(__dirname + '/public/templates/RejectionEmailTemplate.html', 'utf-8', function(err, html) {
            if(!err) {
                mailClient.sendRejectionEmail(date, rejectee, rejector, html);
            } else {
                console.log('Error sending rejection email: ' + err);
            }
        });
    }

    db.collection('dates', function(err, collection){

        collection.remove({_id: ObjectID(date._id)}, {safe:true}, function(err, result){

            if (err) {
                res.send({'error':'An error has occurred - ' + err});

            } else {
                console.log('' + result + ' date deleted');

                // if(date.approval_transaction_id){
                //     // remove transaction
                //     // cancel preapproval
                //     db.collection('transactions', function(err, collection) {

                //         collection.findAndModify({'_id': modified_date.approval_transaction_id },{safe: true, remove: true}, function(err, item) {
                //             console.log('FOUND TRANSACTION TO CANCEL');

                //             paypal.cancelPreapproval(item.paypal_approval_id);

                //         });
                //     });
                // }

                // remove date from both participants
                db.collection('users', function(err, usersCollection){

                    usersCollection.update({ _id : { $in : ids } },{ $pull: { dates: ObjectID(date._id) }},{ multi: true }, function(err, result){

                        if (err) {
                            console.log('Error removing dates from user: ' + err);

                            res.end(err);
                        } else {
                            console.log('' + result + ' document(s) updated');
                            res.end('success');
                        }

                    });
                });
            }

        });
    });
}

exports.addUser = function(req, res) {

    var user = { 
        _id: req.body._id, 
        name: req.body.name, 
        email: req.body.email,
        photo_small: req.body.photo_small,
        photo_normal: req.body.photo_normal,
        photo_large: req.body.photo_large,
        dates: [],
        status: 'single'
    };

    console.log('Adding user: ' + JSON.stringify(user));

    db.collection('users', function(err, collection) {

        collection.insert(user, {safe:true}, function(err, result) {

            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);

                // send new user email
                res.render('NewUserEmailTemplate.html', {title: 'tangle', name: user.name }, function(err, html){
                    if(err) {
                        // need to send to techops
                        console.log("Error sending new user email: " + err);
                    } else {
                        mailClient.sendNewUserEmail(user, html);
                    }
                });
            }
        });
    });
};
 
exports.updateUser = function(req, res) {

    var user = req.body;

    console.log(JSON.stringify(user));

    db.collection('users', function(err, collection) {

        collection.update({'_id': user._id}, user, {safe:true}, function(err, result) {

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

exports.addTransaction = function(date_id, approval_id, timestamp, amount){

    var transaction = {
        date_id: date_id,
        paypal_approval_id: approval_id,
        paypal_timestamp: timestamp, 
        is_approved: false,
        amount: parseFloat(amount)
    };

    db.collection('transactions', function(err, collection) {

        collection.insert(transaction, {safe:true}, function(err, result) {

            if (err) {
                // should send email w details
                console.log({'error':'An error has occurred adding a transaction for: ' + JSON.stringify(transaction)});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));

                db.collection('dates', function(err, datesCollection){

                    datesCollection.update({_id: ObjectID(date_id) }, { $set: { approval_transaction_id: result[0]._id }}, function(err, dateResult){
                        if(err){
                            console.log('error updating date transaction field: ' + err);
                        } else {
                            console.log(dateResult);
                        }
                    });
                });
            }
        });
    });
}