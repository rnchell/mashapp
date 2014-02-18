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
  self.photo = 'url(' + user.photo + ')';
  self.isUserLoggedIn = true;
};
