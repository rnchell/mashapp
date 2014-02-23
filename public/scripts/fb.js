  var createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  var deleteCookie = function(name){
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  function getCookie(c_name) {
      if (document.cookie.length > 0) {
          c_start = document.cookie.indexOf(c_name + "=");
          if (c_start != -1) {
              c_start = c_start + c_name.length + 1;
              c_end = document.cookie.indexOf(";", c_start);
              if (c_end == -1) {
                  c_end = document.cookie.length;
              }
              return unescape(document.cookie.substring(c_start, c_end));
          }
      }
      return "";
  }    

  if(getCookie('mash_user')){
    console.log('cookie exists');
    viewModel.isUserLoggedIn(true);
  }

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
          createCookie('mash_user', response.authResponse.accessToken, 1);
          // FB.api('/me', function(response) {
          //   console.log('Good to see you, ' + response.name + '.');
          // });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      }, {scope: 'email'});
    }

    $('#fb-button').click(function () {
      loadFBDialog();
    });

    FB.getLoginStatus(function(response){
      if(response.status === 'connected'){
        createCookie('mash_user', response.authResponse.accessToken, 1);
        console.log('getLoginStatus: connected');
      } else if (response.status === 'not_authorized'){
        console.log('getLoginStatus: not-authorized');
        console.log('REMOVING COOKIE');
        deleteCookie('mash_user');
        viewModel.isUserLoggedIn(false);
      } else {
        console.log('getLoginStatus: not logged in');
        console.log('REMOVING COOKIE');
        deleteCookie('mash_user');
        viewModel.isUserLoggedIn(false);
      }
    });

    FB.Event.subscribe('auth.authResponseChange', function(response) {
      if (response.status === 'connected') {
        console.log('auth.authResponseChange: connected');
        viewModel.isUserLoggedIn(true);
        viewModel.selectedView(new View("friendsTemplate", new friendsViewModel()));
        getUser(response.authResponse.userID);
      } else if (response.status === 'not_authorized') {
        console.log('NOT AUTHORIZED');
        deleteCookie('mash_user');
        FB.login(function(response) {

        });
      } else {
        console.log('LAST ELSE');
        deleteCookie('mash_user');
        FB.login(function(response) {
        });
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
        userViewModel = new UserViewModel(userObj);
        viewModel.isUserModelCreated(true);  

        getFriendsList();

      } else {
        FB.api('/me?fields=picture.type(square),name, email', function(response) {

          $.post('/user/add/', 
            { 
              _id: response.id, 
              name: response.name, 
              email: response.email,
              photo_small: response.picture.data.url,
              photo_normal: response.picture.data.url.replace('_q.jpg', '_s.jpg'),
              photo_large: response.picture.data.url.replace('_q.jpg', '_n.jpg').replace('/t5/', '/t1/p200x200/'),
            },
            function(data){
              user = data;
              
              userViewModel = new UserViewModel(user);
              viewModel.isUserModelCreated(true);
              
              getFriendsList();
            }
          );

        });
      }
    });
  }

  function getFriendsList(){
    FB.api('/me/friends', function(result) {

      var friend_list = result.data;
      // var photo_hash = {};

      // _.each(friend_list, function(item){
      //   photo_hash[item.id] = item.picture.data.url;
      // });

      //var ids = Object.keys(photo_hash);
      var ids = _.map(friend_list, function(f){ return f.id; });

      $.post('/friends/', {ids: ids}, function(data){
        if(data){
          var friends = [];

          for(var i=0; i < data.length; i++){
            var u = data[i];
            u.photo_large = u.photo_large;
            u.status = u.status;
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