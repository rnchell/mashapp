var friendsViewModel = function(){
  var self = this;
  
  self.users = ko.observableArray();
  self.dateHolder = [];

  self.match = function(user, event){
    console.log(self.dateHolder.length);
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

        var proposalUI = new DateViewModel(self.dateHolder, moment({hour: 19}).day(2).format("dddd, MMMM Do YYYY, h:mm:ss a"), null, null, userViewModel.user, 0, 'Proposed');
        viewModel.selectedView({ templateName: "proposalTemplate", data: proposalUI});
        self.dateHolder = [];
     }
  };
}