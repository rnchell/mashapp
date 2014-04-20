require('newrelic');

var everyauth = require('everyauth');

everyauth.debug = true;

var express = require("express"),
	fs = require('fs'),
	app = express(),
	port = parseInt(process.env.PORT, 10) || 5000,
	mongoClient = require('./mongoClient'),
	swig = require('swig')

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

everyauth.everymodule.findUserById( function (userId, callback) {
  mongoClient.findUserById(userId, callback);
});

everyauth.everymodule.userPkey('_id');

everyauth
  .facebook
    .appId('232433826959882')
    .appSecret('18f9fec6b23ccc1f671fe1940db72357')
    .handleAuthCallbackError( function (req, res) {

	  })
	  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
	  	
	  	var promise = this.Promise();

	  	mongoClient.getUserById(fbUserMetadata.id, promise);

	  	return promise;
	  })
    .redirectPath('/');

everyauth.facebook
  .scope('email');

app.use(express.static(__dirname + '/public'))
  .use(express.favicon())
  .use(express.methodOverride())
  .use(express.json())
  .use(express.bodyParser())
  .use(express.cookieParser('htuayreve'))
  .use(express.session())
  .use(everyauth.middleware());

app.configure( function () {
  app.set('views', __dirname + '/public/views');
  app.engine('html', swig.renderFile);
});

// remove for prod
app.set('view cache', false);
swig.setDefaults({ cache: false });

// var paypal = require('./paypal');

// app.get('/paypal/pay/', paypal.payRequest);

// app.get('/paypal/preapprove/', paypal.preApprove);

// app.get('/paypal/preapproval/success/', mongoClient.authorizePreapprovalTransaction);

// app.get('/paypal/cancel/', paypal.cancelPreapproval);

app.get('/', function(req,res){

	if(req.loggedIn){
		console.log('LOGGED IN');
		
		res.render('indexView.html');
	} else {
		console.log('user not logged in');
		
		res.render('loginView.html');
	}
});

app.get('/user', function(req,res){

	if(req.loggedIn){
		res.send(req.user);
	} else {
		res.send(401);
	}
});

app.get('/facebook/user/friends', function(req,res){

	var oauth = everyauth.facebook.oauth;
		
		var fqlUrl = "https://graph.facebook.com/fql?" + 
		"q=SELECT+uid,name,pic,pic_big,pic_square,is_app_user+FROM+user+WHERE+uid+IN(SELECT+uid2+FROM+friend+WHERE+uid1=me())";//"https://graph.facebook.com/fql?q=SELECT+uid2+photo+FROM+friend+WHERE+uid1=me()";

		oauth.get(fqlUrl, req.session.auth.facebook.accessToken, function (err, data) {

			if(!err){

				var friends = JSON.parse(data).data;

				res.send(friends);
			} else {
				console.log(err);
			}
		});
});

app.post('/users', mongoClient.getUsers);

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
