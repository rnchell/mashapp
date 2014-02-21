function View(templateName, data) {
  this.templateName = templateName;
  this.data = data;
};

function ViewModel() {
  var self = this;
  self.isUserLoggedIn = ko.observable(false);
  self.isUserModelCreated = ko.observable(false);
  self.selectedView = ko.observable();
  
  self.goToHomeView = function () {
    self.selectedView({templateName: "friendsTemplate", data: friendsViewModel}); 
  };
  self.goToDatesView = function () {
    self.selectedView({templateName: "datesTemplate", data: userViewModel})
  }
};

var viewModel = new ViewModel();

$(function() {
  ko.applyBindings(viewModel, document.getElementById('container'));
});
