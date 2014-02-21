var express = require("express"),
	fs = require('fs'),
	app = express(),
	port = parseInt(process.env.PORT, 10) || 3000,
	mongoClient = require('./mongoClient')
	//redis = require('redis'),
	//client = redis.createClient();

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
});

// client.on("connect", function () {
// 	console.log("Connected to redis client. run startup scripts");
	
// 	//client.flushdb();

// 	// add some test users
// 	//client.set('5740502', JSON.stringify({user_id: '5740502', name: 'Buddy Chell', email: 'buddy@gmail.com', photo: "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn1/t1/c55.55.690.690/s200x200/602806_10101469445541208_403235931_n.jpg"}));
// 	//client.set('15000390', JSON.stringify({user_id: '15000390', name: 'Alexa Jurczak', email: 'akjurczak@gmail.com', photo: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash1/t5/371831_4003197_1144548954_s.jpg'}));
// 	//client.set('4003197', JSON.stringify({user_id: '4003197', name: 'Molly Gilbert', email: 'mollygilbert@gmail.com', photo: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn2/t5/1116901_15000390_2124234670_s.jpg'}));
// });

// client.on("error", function (err) {
// 	console.log("Error " + err);
// });

app.get('/', function (req, res) {
	fs.readFile('index.html', function (err, html) {
		res.writeHeader(200, {"Content-Type": "text/html"});
		res.write(html);
		res.end();
	});
});

app.get('/user/:id', mongoClient.getById);

app.get('/dates/', mongoClient.getDates);

app.post('/user/add', mongoClient.addUser);

app.post('/user/update/:id', mongoClient.updateUser);

app.post('/dates/add', mongoClient.addDate);

app.get('/friends/', mongoClient.getFriends);

app.delete('/user/delete/:id', mongoClient.deleteUser);

mongoClient.connect();
app.listen(port);