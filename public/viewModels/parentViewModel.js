function View(templateName, data) {
  this.templateName = templateName;
  this.data = data;
};

var viewModel = {
  views: ko.observableArray([
    new View("friendsTemplate", new friendsViewModel()),
    new View("proposalTemplate", dateViewModel)
  ]),
  selectedView: ko.observable()
};
