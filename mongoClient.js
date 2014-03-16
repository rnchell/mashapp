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

var USERS_GET_BY_ID_ERROR_MSG = "Error in Users GetById";
var USERS_GET_ALL_ERROR_MSG = "Error in Users GetAll";
var USERS_GET_FRIENDS_ERROR_MSG = "Error in Users GetFriends";
var USERS_GET_DATES_ERROR_MSG = "Error in Users GetDates";
var USERS_ADD_DATE_ERROR_MSG = "Error in Users AddDate";
var USERS_ADD_NEW_ERROR_MSG = "Error in _AddUser";

exports.addDate = function(req, res){

    var ids = req.body.ids;
    var date = req.body.date;

    date.created = moment().utc().format();
    date.acceptedCount = parseInt(date.acceptedCount);

    db.collection('dates', function(err, datesCollection){

        if(!err){

            datesCollection.insert(date, {safe: true}, function(err, result){

                if(!err){

                    res.end(JSON.stringify(result[0]));

                    addDateToUsers(ids, result[0]);
                }else{
                    console.log('Error adding new date: ' + err);
                    mailClient.sendErrorEmail(USERS_ADD_DATE_ERROR_MSG + ': ' + err);
                    res.end(500);
                }
            });
        } else {

            mailClient.sendErrorEmail(USERS_ADD_DATE_ERROR_MSG + ': ' + err);
        }
    });
}

var addDateToUsers = function(user_ids, date) {

    console.log('adding date to users: ' + JSON.stringify(date));

    var dateObjectID = ObjectID(date._id.toString());
    var registeredUsers = [];
    var unregisteredUsers = [];

    _.each(date.participants, function(p) {
      if(p.is_registered === 'true'){
        registeredUsers.push(p);
      } else {
        p.dates = [];
        p.dates.push(dateObjectID);

        p.status = 'available';
        unregisteredUsers.push(p);
      }
    });

    // console.log('REGISTERED USERS: ' + JSON.stringify(registeredUsers));
    // console.log('UNREGISTERED USERS: ' + JSON.stringify(unregisteredUsers));

    // create new users and add date
    if(unregisteredUsers.length > 0){
      _addUnregisteredUsers(unregisteredUsers);

      // send invite email
      _.each(unregisteredUsers, function(user){
        mailClient.sendInvite(user, date.matchmaker.name);
      });
    }

    if(registeredUsers.length === 0)
      return;

    db.collection('users', function(err, userCollection) {

        userCollection.update({ _id : { $in : user_ids } },{ $addToSet: { dates: dateObjectID }},{ multi: true }, function(err, result){

            if(err){
                console.log('Error adding date to user: ' + err);
                mailClient.sendErrorEmail(USERS_ADD_DATE_ERROR_MSG + ': ' + err);
            } else {

                fs.readFile(__dirname + '/public/templates/NewDateProposalEmailTemplate.html', 'utf-8', function(err, html) {
                    if(!err) {
                      mailClient.sendDateProposalEmail(date, html);
                    } else {
                        console.log(err);
                        mailClient.sendErrorEmail(USERS_ADD_DATE_ERROR_MSG + ': ' + err);
                    }
                });
            }
        });
    });
}

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

var _addUnregisteredUsers = function(users){

  console.log('Adding users: ' + JSON.stringify(users));

  for(var i=0; i < users.length; i++){

    var user = users[i];

    user.is_registered = (user.is_registered === 'true' || user.is_registered === true);

    db.collection('users', function(err, collection) {

      collection.update({ _id : user._id }, user, {upsert: true, safe: true}, function(err, result){
        if (err) {
          mailClient.sendErrorEmail(USERS_ADD_NEW_ERROR_MSG + ': ' + err);
        } else {
            console.log('Success: ' + JSON.stringify(result));
        }
      });

    });
  }
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
        status: 'single',
        is_registered: true
    };

    console.log('Adding user: ' + JSON.stringify(user));

    db.collection('users', function(err, collection) {

      collection.findOne({_id : user._id}, function(err, result){
        if(!err){

          // if user exists already, just update existing to set is_registered = true
          if(result){
            console.log('FOUND UNREGISTERED USER');

            // user may have existing dates
            user.dates = result.dates;
            _updateUser(user);

            res.send(user);

            // send new user email
            res.render('NewUserEmailTemplate.html', {title: 'tangle', name: user.name }, function(err, html){
              if(err) {
                // need to send to techops
                console.log("Error sending new user email: " + err);
              } else {
                mailClient.sendNewUserEmail(user, html);
              }
            });

          } else {

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

          }
        }
      });
  });
}

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
}

exports.close = function() {

    mailClient.close();
}

exports.connect = function(){

    console.log('trying to connect to mongo...');

    MongoClient.connect(config.DATABASE_URI, function(err, mdb) {

      if(!err){
        console.log('connected to mashdev mongodb');
        db = mdb;
      } else{
        console.log('error connecting to mongodb: ' + err);
        mailClient.sendErrorEmail('Error connecting to mongodb: ' + err);
      }

    });
}

exports.deleteDate = function(req, res){

    res.end('');
}

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
}

exports.getAll = function(req, res) {

    db.collection('users', function(err, collection) {

        if(err){
            var errorDetails = {
                request: req,
                response: res,
                error: err
            };

            mailClient.sendErrorEmail(USERS_GET_ALL_ERROR_MSG + ': ' + JSON.stringify(errorDetails));

            res.send(500);
        } else {
            collection.find().toArray(function(err, items) {

                if(err){

                    var errorDetails = {
                        request: req,
                        response: res,
                        error: err
                    };

                    mailClient.sendErrorEmail(USERS_GET_ALL_ERROR_MSG + ': ' + JSON.stringify(errorDetails));

                    res.send(500);
                } else {
                    res.send(items);
                }

            });
        }
    });
}

exports.getById = function(req, res) {

    var id = req.params.id;

    console.log('Retrieving user: ' + id);

    db.collection('users', function(err, collection) {

        if(err){

            mailClient.sendErrorEmail(USERS_GET_BY_ID_ERROR_MSG + ': ' + err);

            res.send(500);
        } else {
            collection.findOne({'_id': id}, function(err, item) {

                if(err) {

                    mailClient.sendErrorEmail(USERS_GET_BY_ID_ERROR_MSG + ': ' + err);

                    res.send(500);
                } else {
                    res.send(item);
                }
            });
        }
    });
}

exports.getDates = function(req, res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    if(!query.ids){
        res.send(400);
    }

    var date_ids = [];

    if(!Array.isArray(query.ids)){
        date_ids.push(new ObjectID(query.ids));
    } else{
        date_ids = _.map(query.ids, function(id){
             return ObjectID(id);
        });
    }

    db.collection('dates', function(err, collection){

        if (!err) {
            collection.find({ _id : { $in : date_ids } }).toArray(function(err, dates){

                if(!err) {
                    res.send(dates);
                } else {
                    mailClient.sendErrorEmail(USERS_GET_DATES_ERROR_MSG + ': ' + err);
                    res.send(500);
                }
            });
        } else {
            mailClient.sendErrorEmail(USERS_GET_DATES_ERROR_MSG + ': ' + err);
            res.send(500);
        }
    });
}

exports.getFriends = function(req, res){

    var ids = req.body.ids;

    db.collection('users', function(err, collection){

        if(!err){

            collection.find({ _id : { $in : ids } }).sort({ name: 1 }).toArray(function(err, items){

                if(!err){
                    res.send(items.clean(null));
                } else {
                    console.log('Error getting user friends: ' + err);
                    var errorDetails = {
                        request: req,
                        response: res,
                        error: err
                    };

                    mailClient.sendErrorEmail(USERS_GET_FRIENDS_ERROR_MSG + ': ' + JSON.stringify(errorDetails));

                    res.send(500);
                }

            });

        } else {

            mailClient.sendErrorEmail(USERS_GET_FRIENDS_ERROR_MSG + ': ' + err);

            res.send(500);
        }
    });
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

var _updateUser = function(user){

  console.log('_updateUser: ' + JSON.stringify(user));

  user.is_registered = (user.is_registered === 'true' || user.is_registered === true);

  for(var i=0; i < user.dates.length; i++){
    var date = user.dates[i];

    console.log(date);
    user.dates[i] = new ObjectID(date.toString());
  }

  db.collection('users', function(err, collection) {

      collection.update({'_id': user._id}, user, {safe:true}, function(err, result) {

          if (err) {
              console.log('Error updating user: ' + err);
          } else {
              console.log('' + result + ' document(s) updated');
          }
      });
  });
}

exports.updateUser = function(req, res) {

    var user = req.body;

    console.log(JSON.stringify(user));

    if(!user.hasOwnProperty('dates')){
        user.dates = [];
    }

    // hack: have to do some type conversion since values are sent as strings
    user.is_registered = (user.is_registered === 'true' || user.is_registered === true);

    for(var i=0; i < user.dates.length; i++){
      var date = user.dates[i];
      user.dates[i] = new ObjectID(date);
    }

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
}
