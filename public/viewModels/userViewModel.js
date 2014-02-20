var UserObject = function (id, dates, name, email, photo, status) {
  this.id = id;
  this.dates = dates;
  this.name = name;
  this.email = email;
  this.photo = photo;
  this.status = status;
}

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
  	var userObject = new UserObject(self.user._id, self.dates(), self.user.name, self.user.email, self.user.photo, self.status());
    $.post('/user/update/' + self.user._id, userObject, function(data){
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