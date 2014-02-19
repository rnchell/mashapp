function View(templateName, data) {
  this.templateName = templateName;
  this.data = data;
};

var viewModel = {
  views: ko.observableArray([
    new View("friendsTemplate", new friendsViewModel()),
    new View("proposalTemplate", dateViewModel)
  ]),
  isUserLoggedIn: ko.observable(false),
  isUserModelCreated: ko.observable(false),
  selectedView: ko.observable()
};

$(function() {
  ko.applyBindings(viewModel, document.getElementById('container'));
});
