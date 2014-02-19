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
    $.post('/dates/add/', 
      { 
        ids: _.map(self.participants, function(u){ return u._id; }),
        date: {
          message: self.message,
          acceptedCount: 0,
          state: "Proposed", // make enum?
          location: self.location(),
          time: self.time,
          // creating slimmed down user objects for participants to prevent nested date arrays
          // can change this if need be
          // should we include photo?
          participants: _.map(self.participants, function(u){ return { _id: u._id, name: u.name, email: u.email } }),
          matchmaker: self.matchmaker
        } 
      },
      function(data){
      }
    );
  };
};

var usersViewModel = function(){
  var self = this;
  
  self.users = ko.observableArray();
  self.dateHolder = [];

  self.match = function(user, event){
    if (self.dateHolder.length === 0) {
      self.dateHolder.push(user);
     } else if (self.dateHolder[0] === user){
        self.dateHolder.pop();
     } else {
        self.dateHolder.push(user);

        // need to sort by id so mongo will only insert new date if object doesnt exist already
        // doesnt need to stay here, but until a better solution is found, fuck it
        self.dateHolder.sort(function compare(a,b) {
          if (a._id < b._id)
             return -1;
          if (a._id > b._id)
            return 1;
          return 0;
        });

        var proposalUI = new proposalViewModel(self.dateHolder, moment({hour: 19}).day(2).format("dddd, MMMM Do YYYY, h:mm:ss a"), "", "You guys should probably go out.");
        viewModel.selectedView({ templateName: "proposalTemplate", data: proposalUI});
        loadScript();
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
