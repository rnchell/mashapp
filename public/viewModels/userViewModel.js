var userViewModel = function(user){
  var self = this;
  self.user = user;
  self.photo = 'url(' + user.photo + ')';
  self.isUserLoggedIn = true;
};