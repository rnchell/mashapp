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
          state: "proposed", // make enum?
          location: self.location(),
          time: self.time,
          // TODO: decide if we need all photo sizes or just one
          participants: _.map(self.participants, function(u){ return { _id: u._id, name: u.name, email: u.email, photo_large: u.photo_large } }),
          matchmaker: { name: self.matchmaker.name, email: self.matchmaker.email }
        } 
      },
      function(data){
        console.log(data);
      }
    );
  };
};