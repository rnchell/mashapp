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

  self.addProposal = function(){
    // add proposedDate to each participants
  };
};

var usersViewModel = function(){
  var self = this;
  
  self.users = ko.observableArray();
  self.dateHolder = [];

  self.match = function(user){
    if (self.dateHolder.length === 0) {
      self.dateHolder.push(user);
     } else if (self.dateHolder[0] === user){
        self.dateHolder.pop();
     } else {
        self.dateHolder.push(user);
        var proposalUI = new proposalViewModel(self.dateHolder, moment({hour: 19}).day(2).format("dddd, MMMM Do YYYY, h:mm:ss a"), "", "You guys should probably go out.");
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
  self.photo = 'url(' + user.photo + ')';
  self.isUserLoggedIn = true;
};
