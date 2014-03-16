var DateViewModel = function(participants, time, location, message, matchmaker, acceptedCount, state){
  var self = this;

  self.state = state;
  self.matchmaker = matchmaker;
  self.acceptedCount = acceptedCount;
  self.participants = participants;
  self.time = time;
  self.hour = ko.observable();
  self.location = ko.observable(location);
  self.message = ko.observable("Love ya both. You should go on this date!");
  self.payment = 0;

  self.canSubmitProposal = function(){
    return self.participants[0].email !== '' && self.participants[1].email !== '';
  };

  self.addProposal = function(){

    //var internalApprovalId = self.payment > 0 ? (new Date()).getTime() : undefined;

    // 1. create date, passing along internalApprovalId if self.payment > 0
    // 2. on post response, if create date successful and internalApprovalId, hit /paypal/preapprove/?id=internalApprovalId

    if(self.participants[0].email === '' || self.participants[1].email === ''){
      // cant continue, show error message
      return;
    }

    console.log('SENDING EMAIL!');
    console.log(self.participants);

    $.post('/dates/add/',
      {
        ids: _.map(self.participants, function(u){ return u._id; }),
        date: {
          message: self.message(),
          acceptedCount: 0,
          state: "proposed", // make enum
          location: self.location(),
          time: '' + self.time + ' ' + self.hour(),
          participants: _.map(self.participants, function(u){ return { _id: u._id, name: u.name, email: u.email, photo_large: u.photo_large, is_registered: u.is_registered } }),
          matchmaker: { name: self.matchmaker.name, email: self.matchmaker.email }
        }
      },
      function(data){

        var newDate = JSON.parse(data);
        console.log(newDate);

        //if(self.payment > 0){
          //window.location = "http://localhost:5000/paypal/preapprove/?id=" + newDate._id + "&amount=" + self.payment;
          // $.get('/paypal/preapprove/?id=' + newDate._id + '&amount=' + self.payment, function(response){
          //   console.log(response);
          // });
        //}
      }
    );
    if (self.payment === 0) {
      viewModel.goToHomeView();
    }
  };

  self.doPreapproval = function(model, event){
    $('.payment-option').removeClass('selected-amount');
    var el = $(event.target)
    var amount = el.text().slice(1);
    el.addClass('selected-amount');
    self.payment = amount;
  };
};
