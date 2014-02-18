// //Date Model
function DateModel(createdAt, dateTime, place, participants, acceptCount) {
	this.createdAt = createdAt;
	this.dateTime = dateTime;
	this.place = place;
	this.participants = participants;
	this.acceptCount = acceptCount;
}

function View(templateName, data) {
  this.templateName = templateName;
  this.data = data;
};

var proposalViewModel = function(participants, time, location, message, matchmaker, acceptedCount, state){
  var self = this;

  self.state = state;
  self.matchmaker = matchmaker;
  self.acceptedCount = acceptedCount;
  self.participants = participants;
  self.time = time;
  self.location = ko.observable(location);
  self.message = ko.observable(message);
};

// var usersViewModel = {
// 	users: ko.observableArray()
// };

var usersViewModel = function(){
  var self = this;
  
  this.users = ko.observableArray();
  this.dateHolder = [];

  this.match = function(user){
    if (self.dateHolder.length === 0) {
      console.log("first to be asked");
      self.dateHolder.push(user);
     } else if (self.dateHolder[0] === user){
        self.dateHolder.pop();
     } else {
      self.dateHolder.push(user);
       console.log('We have a proposed match!');
       var dateModel = new DateModel(new Date(), "Wed, March 5 at 7pm", "1335 Filbert Street", [], []);
       var proposalUI = new proposalViewModel(self.dateHolder, new Date(), "test", "message");
       viewModel.selectedView({ templateName: "proposalTemplate", data: proposalUI});
     }
  };
}

var viewModel = {
  views: ko.observableArray([
    new View("userTemplate", new usersViewModel()),
    new View("proposalTemplate", proposalViewModel)
    ]),
  selectedView: ko.observable()
};

var accountViewModel = function(user){
  var self = this;

  self.user = user;
  self.photo = user.photo;
  self.isUserLoggedIn = true;
};

$(function() {
  //ko.applyBindings(new accountViewModel(), document.getElementById('account-view'));  
});

//$(function() {
  //ko.applyBindings(viewModel, document.getElementById('content'));
//});
//$(function () {

	// $.get('/friends', function(data) {
	// 	usersModel.users = ko.observableArray(data.friends);
	// 	viewModel.selectedView(new View("userTemplate", usersModel));
	// });

  //ko.applyBindings(viewModel, document.getElementById('content'));
//});

//maybe i put this in the viewModel because it will be used to navigate
//between views and to change the selectedView context
// 	self.dateHolder = [];
// 	self.match = function(user) {
// 		if (self.dateHolder.length === 0) {
//       console.log("first to be asked");
//       self.dateHolder.push(user);
// 		} else if (self.dateHolder[0] === user){
//       self.dateHolder.pop();
// 		} else {
// 			var dateModel = new DateModel(new Date(), "Wed, March 5 at 7pm", "1335 Filbert Street", [], []);
// 			var dateProposalUI = new DateProposalUI(dateModel); 
// 		}
// 	}
// }