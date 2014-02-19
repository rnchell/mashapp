
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(47.621948,-122.337491),
    zoom: 12
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' +
      'callback=initialize';
  document.body.appendChild(script);
}

// window.onload = loadScript;