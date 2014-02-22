var UserViewModel = function(user){
  var self = this;
  self.user = user;
  self.dates = ko.observableArray(user.dates);
  self.datesHolder = ko.observableArray();
  self.status = ko.observable(user.status.toLowerCase());
  self.photo_small = 'url(' + user.photo_small + ')';
  self.photo_normal = 'url(' + user.photo_normal + ')';
  self.photo_large = 'url(' + user.photo_large + ')';
  self.isUserLoggedIn = true;
  
  self.toggleStatus = function () {
  	if (self.status() === "available") {
      self.status("taken");
  	} else {
  		self.status("available")
  	}
  	self.saveStatus();
  };
  self.saveStatus = function () {
    $.post('/user/update/' + self.user._id, {status: self.status()}, function(data){
      console.log(data)
  	});
  };
  self.delete = function () {
  	$.ajax({
	    url: '/user/delete/' + self.user._id,
	    type: 'DELETE',
	    success: function(result) {
	      console.log("removed " + result)
	    }
    });
  };
  self.getDates = function (callback) {
		$.get('/dates/?ids=' + self.dates().join('&ids='), function (data) {
      self.datesHolder(data);
      callback();
		});
  };

  self.getOtherParticipant = function(date, id) {
      return ko.utils.arrayFirst(date.participants, function(item) {
          return item._id !== id;
      });
  };

  self.acceptProposal = function(date){
    console.log('ACCEPTING PROPOSAL: ' + date._id);
    $.post('/user/dates', {id: date._id},function(data){
      self.datesHolder.remove(date);
      self.dates.remove(date._id);
    });
  }
};