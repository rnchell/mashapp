var userViewModel = function(user){
  var self = this;
  self.user = user;
  self.status = ko.observable(user.status.toLowerCase());
  self.photo = 'url(' + user.photo + ')';
  self.isUserLoggedIn = true;
  self.toggleStatus = function () {
  	if (self.status() === "available") {
      self.status("taken");
  	} else {
  		self.status("available")
  	}
  }
};