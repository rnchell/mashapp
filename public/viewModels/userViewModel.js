var UserViewModel = function(user){
  var self = this;
  self.user = user;
  self.dates = ko.observableArray(user.dates);
  self.datesHolder = ko.observableArray();
  self.status = ko.observable(user.status.toLowerCase());
  self.photo_small = user.photo_small;
  self.photo_normal = user.photo_normal;
  self.photo_large = user.photo_large;
  self.isUserLoggedIn = true;
  
  self.toggleStatus = function () {
  	if (self.status() === "single") {
      self.status("taken");
  	} else {
  		self.status("single")
  	}
  	self.saveStatus();
  };
  self.saveStatus = function () {

    self.user.status = self.status();

    $.post('/user/update/', user, function(data){
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
    $.post('/user/dates/accept/', {date_id: date._id, user_id: self.user._id},function(data){
      self.datesHolder.remove(date);
      self.dates.remove(date._id);

      viewModel.goToHomeView();
    });
  }

  self.rejectProposal = function(date){
    $.post('/user/dates/reject/', {id: self.user._id, date: date}, function(data){
      self.datesHolder.remove(date);
      self.dates.remove(date._id);

      viewModel.goToHomeView();
    });
  }
};