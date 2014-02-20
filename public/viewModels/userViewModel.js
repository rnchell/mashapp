var UserViewModel = function(user){
  var self = this;
  self.user = user;
  self.dates = ko.observableArray(user.dates);
  self.status = ko.observable(user.status.toLowerCase());
  self.photo = 'url(' + user.photo + ')';
  self.isUserLoggedIn = true;
  self.toggleStatus = function () {
  	if (self.status() === "available") {
      self.status("taken");
  	} else {
  		self.status("available")
  	}
  	self.save();
  };
  self.save = function () {
  	var userJSON = ko.toJSON(self.user);
  	console.log(userJSON);
    $.post('/user/update/' + self.user._id, userJSON, function(data){
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
  }
};