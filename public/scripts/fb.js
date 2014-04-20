//   var createCookie = function(name, value, days) {
//     var expires;
//     if (days) {
//         var date = new Date();
//         date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//         expires = "; expires=" + date.toGMTString();
//     }
//     else {
//         expires = "";
//     }
//     document.cookie = name + "=" + value + expires + "; path=/";
//   }

//   var deleteCookie = function(name){
//     document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//   }

//   function getCookie(c_name) {
//       if (document.cookie.length > 0) {
//           c_start = document.cookie.indexOf(c_name + "=");
//           if (c_start != -1) {
//               c_start = c_start + c_name.length + 1;
//               c_end = document.cookie.indexOf(";", c_start);
//               if (c_end == -1) {
//                   c_end = document.cookie.length;
//               }
//               return unescape(document.cookie.substring(c_start, c_end));
//           }
//       }
//       return "";
//   }

//   // if(getCookie('mash_user')){
//   //   viewModel.isUserLoggedIn(true);
//   // }

// (function() {
//   Array.prototype.clean = function(deleteValue) {
//   for (var i = 0; i < this.length; i++) {
//     if (this[i] == deleteValue) {
//       this.splice(i, 1);
//       i--;
//     }
//   }
//   return this;
// };
// })();

// $(function(){
//   var friend_ids = [];

//   window.fbAsyncInit = function() {
//     FB.init({
//       //appId      : '1467905353425793',
//       appId      : '232433826959882',
//       status     : true, // check login status
//       cookie     : true, // enable cookies to allow the server to access the session
//       xfbml      : true  // parse XFBML
//     });

//     function loadFBDialog() {
//       FB.login(function(response) {
//         if (response.authResponse) {
//           //createCookie('mash_user', response.authResponse.accessToken, 1);
//           // FB.api('/me', function(response) {
//           //   console.log('Good to see you, ' + response.name + '.');
//           // });
//         } else {
//           //console.log('User cancelled login or did not fully authorize.');
//         }
//       }, {scope: 'email'});
//     }

//     $('#fb-button').click(function () {
//       loadFBDialog();
//     });

//     // FB.getLoginStatus(function(response){
//     //   if(response.status === 'connected'){
//     //     console.log('status: connected');
//     //     //createCookie('mash_user', response.authResponse.accessToken, 1);
//     //     viewModel.isUserLoggedIn(true);

//     //     userViewModel = new UserViewModel("{% everyauth.user %}");

//     //     viewModel.isUserModelCreated(true);
//     //     viewModel.selectedView(new View("friendsTemplate", new friendsViewModel()));
//     //     getFriendsList();
//     //   } else if (response.status === 'not_authorized'){
//     //     //console.log('getLoginStatus: not-authorized');
//     //     //console.log('REMOVING COOKIE');
//     //     deleteCookie('mash_user');
//     //     viewModel.isUserLoggedIn(false);
//     //   } else {
//     //     //console.log('getLoginStatus: not logged in');
//     //     //console.log('REMOVING COOKIE');
//     //     deleteCookie('mash_user');
//     //     viewModel.isUserLoggedIn(false);
//     //   }
//     // });

//     FB.Event.subscribe('auth.authResponseChange', function(response) {
//       if (response.status === 'connected') {
//         console.log('auth.authResponseChange: connected');

//         viewModel.isUserLoggedIn(true);
//         viewModel.selectedView(new View("friendsTemplate", new friendsViewModel()));
//         console.log(response.authResponse);
//         getUser(response.authResponse.userID);
//       } else if (response.status === 'not_authorized') {
//         FB.login(function(response) {

//         });
//       } else {
//         FB.login(function(response) {
//         });
//       }
//     });
//   };

//   // Load the SDK asynchronously
//   (function(d){
//    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
//    if (d.getElementById(id)) {return;}
//    js = d.createElement('script'); js.id = id; js.async = true;
//    js.src = "//connect.facebook.net/en_US/all.js";
//    ref.parentNode.insertBefore(js, ref);
//   }(document));

//   function getUser(user_id) {

//     $.get('/user/' + user_id, function(data){

//       userObj = data;

//       if(userObj._id && (!userObj.hasOwnProperty('is_registered') || userObj.is_registered === true)){
//         userViewModel = new UserViewModel(userObj);
//         viewModel.isUserModelCreated(true);

//         getFriendsList();

//       } else {
//         FB.api('/me?fields=picture.type(square),name, email', function(response) {

//           $.post('/user/add/',
//             {
//               _id: response.id,
//               name: response.name,
//               email: response.email,
//               photo_small: response.picture.data.url,
//               photo_normal: response.picture.data.url.replace('_q.jpg', '_s.jpg'),
//               photo_large: response.picture.data.url.replace('_q.jpg', '_n.jpg').replace('/t5/', '/t1/p200x200/'),
//             },
//             function(data){
//               user = data;

//               userViewModel = new UserViewModel(user);
//               viewModel.isUserModelCreated(true);

//               getFriendsList();
//             }
//           );

//         });
//       }
//     });
//   }

//   function getFriendsList(){
//     console.log('getting friends');

//     FB.api('/me/friends?fields=name,picture.type(square)', function(result) {

//       console.log(result);

//       var friend_list = result.data;

//       var ids = _.map(friend_list, function(f){ return f.id; });
//       var friendHash = {};

//       _.each(friend_list, function(f) { friendHash[f.id] = f; });

//       $.post('/friends/', {ids: ids}, function(data){
//         if(data){
//           var friends = [];

//           // add existing users
//           for(var i=0; i < data.length; i++){
//             var u = data[i];
//             u.is_registered = true; // needs to be added to model
//             u.photo_large = u.photo_large;
//             u.status = u.status;
//             friends.push(u);
//             delete friendHash[u._id];
//           }

//           // add unregistered users
//           for(var key in friendHash){

//               var ur = friendHash[key];
//               var f = {};
//               f._id = ur.id; // set to 0 for sorting later
//               f.is_registered = false; // needs to be added to model
//               f.status = 'single'; // add style for people who arent users of site
//               f.name = ur.name;
//               f.email = '';
//               f.photo_small = ur.picture.data.url;

//               var url = $('<a>', { href:ur.picture.data.url } )[0];
//               var paths = url.pathname.split('/').clean("");
//               var filename = paths[paths.length-1];
              
//               f.photo_large = url.protocol + url.hostname + '/' + 
//                 paths[0] + '/t1/p200x200/' + filename.replace(/\_[qtas]/g, '_n');

//               f.photo_normal = f.photo_large;//ur.picture.data.url.replace(/\_[qtan]/g, '_s');
              
//               friends.push(f);
//           }

//           friendsViewModel = new friendsViewModel();
//           friendsViewModel.users = ko.observableArray(friends);
//           viewModel.selectedView({templateName: "friendsTemplate", data: friendsViewModel});
//         }
//       });
//     });
//   }
// });
