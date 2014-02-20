$(function(){
  var friend_ids = [];

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '232433826959882',
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    function loadFBDialog() {
      FB.login(function(response) {
      if (response.authResponse) {
        FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
      });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
    }

    $('#fb-button').click(function () {
      loadFBDialog();
    })

    FB.Event.subscribe('auth.authResponseChange', function(response) {
      if (response.status === 'connected') {
        viewModel.isUserLoggedIn(true);
        viewModel.selectedView(new View("friendsTemplate", new friendsViewModel()));
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

    $.get('/user/' + user_id, function(data){
      
      userObj = data;

      if(userObj._id){
        userViewModel = new userViewModel(userObj);
        viewModel.isUserModelCreated(true);  

        getFriendsList();

      } else {
        FB.api('/me?fields=picture.type(square),name, email', function(response) {

          $.post('/user/add/', 
            { 
              _id: response.id, 
              name: response.name, 
              email: response.email,
              photo: response.picture.data.url 
            },
            function(data){
              user = data;
              
              userViewModel = new userViewModel(user);
              viewModel.isUserModelCreated(true);
              
              getFriendsList();
            }
          );

        });
      }
    });
  }

  function getFriendsList(){
    FB.api('/me/friends?fields=name,picture.width(200).height(200)', function(result) {
      // picture size: square, small, normal, large

      var friend_list = result.data;
      var photo_hash = {};

      _.each(friend_list, function(item){
        photo_hash[item.id] = item.picture.data.url;
      });

      var ids = Object.keys(photo_hash);

      $.get('/friends/?ids=' + ids.join('&ids='), function(data){
        if(data){
          var friends = [];

          for(var i=0; i < data.length; i++){
            var u = data[i];
            u.photo = 'url(' + photo_hash[u._id] + ')';
            u.status = 'available';
            friends.push(u);
          }

          friendsViewModel = new friendsViewModel();
          friendsViewModel.users = ko.observableArray(friends);
          viewModel.selectedView({templateName: "friendsTemplate", data: friendsViewModel});
        }
      });
    });
  }
});