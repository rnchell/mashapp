var express = require("express"),
	fs = require('fs'),
	app = express(),
	port = parseInt(process.env.PORT, 10) || 5000,
	mongoClient = require('./mongoClient'),
	engines = require('consolidate')

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

app.configure(function () {
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.static(__dirname + '/public'));
	app.set('views', __dirname + '/public/templates');
	app.engine('html', engines.ejs);
});

var paypal = require('./paypal');

app.get('/paypal/pay/', paypal.payRequest);

app.post('/paypal/preapprove/', paypal.preApprove);

app.get('/paypal/cancel/', paypal.cancelPreapproval);

app.get('/user/:id', mongoClient.getById);

app.get('/dates/', mongoClient.getDates);

app.post('/user/dates/accept/', mongoClient.updateProposedDate);

app.post('/user/dates/reject/', mongoClient.rejectProposedDate);

app.post('/user/add', mongoClient.addUser);

app.post('/user/update/', mongoClient.updateUser);

app.post('/dates/add', mongoClient.addDate);

app.post('/friends/', mongoClient.getFriends);

app.delete('/user/delete/:id', mongoClient.deleteUser);

mongoClient.connect();
app.listen(port);