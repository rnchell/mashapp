var DateViewModel = function(participants, time, location, message, matchmaker, acceptedCount, state){
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
          message: self.message(),
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