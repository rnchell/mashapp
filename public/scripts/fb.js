$(function(){
  var friend_ids = [];

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '232433826959882',
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    FB.Event.subscribe('auth.authResponseChange', function(response) {
      if (response.status === 'connected') {
        // should this be here?
        ko.applyBindings(viewModel, document.getElementById('content'));
        getUser(response.authResponse.userID);
      } else if (response.status === 'not_authorized') {
        FB.login(function(response) {});
      } else {
        FB.login(function(response) {});
      }
    });
  };

  // Load the SDK asynchronously
  (function(d){
   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "http://connect.facebook.net/en_US/all.js";
   ref.parentNode.insertBefore(js, ref);
  }(document));


  function getUser(user_id) {
    // first check to see if user exists
    $.get('/user/' + user_id, function(data){
      
      var userObj = JSON.parse(data);

      if(userObj){
        accountViewModel = new accountViewModel(userObj);
        ko.applyBindings(accountViewModel, document.getElementById('account-view'));  

        getFriendsList();

      } else {
        FB.api('/me?fields=picture.type(square),name, email', function(response) {

          $.post('/user/add/', 
            { 
              user_id: response.id, 
              name: response.name, 
              email: response.email,
              photo: response.picture.data.url },
            function(data){
              user = JSON.parse(data);
              getFriendsList();
            });

        });
      }
    });
  }

  function getFriendsList(){
    FB.api('/me/friends?fields=name,picture.width(200).height(200)', function(result) {
      // picture size: square, small, normal, large

      var friend_list = result.data;
      var photo_hash = {};

      console.log(result.data)

      _.each(friend_list, function(item){
        photo_hash[item.id] = item.picture.data.url;
      });

      var ids = Object.keys(photo_hash);

      $.get('/users/?id=' + ids.join('&id='), function(data){
        if(data){
          var friends = [];

          for(var i=0; i < data.length; i++){
            var u = JSON.parse(data[i]);
            u.photo = 'url(' + photo_hash[u.user_id] + ')';
            u.status = 'single';
            friends.push(u);
          }

          usersViewModel = new usersViewModel();
          usersViewModel.users = ko.observableArray(friends);
          viewModel.selectedView({templateName: "userTemplate", data: usersViewModel});
        }
      });
    });
  }
});