const App = App || {};

// --------
//   MAP
// --------

App.addInfoWindowForStation = function(station, marker) {
    google.maps.event.addListener(marker, 'click', () => {
    if (typeof this.infowindow != "undefined") this.infowindow.close();
    this.infowindow = new google.maps.InfoWindow({
    content: `<h2>${station.name}</h2><img src="${station.image}"><p>${ station.description }</p>`
  });
    this.infowindow.open(this.map, marker);
    this.map.setCenter(marker.getPosition());
    this.map.panBy(0,-150);
  });
};

App.createMarkerForStation = function(station) {
  console.log(station.lat, station.lng);

  let latlng = new google.maps.LatLng(station.lat, station.lng);
  let marker = new google.maps.Marker({
    position: latlng,
    map: this.map,
    icon: "./images/train-marker.png",
  });
  this.addInfoWindowForStation(station, marker);
};



App.loopThroughStations = (data) => {
  console.log(data.stations);
  $.each(data.stations, (index, station) => {
    console.log("wet");
    // setTimeout(() => {
      App.createMarkerForStation(station);
  //  }, index * 500);
  });
};

App.getStations = function() {
  console.log("slag");
  $.get("http://localhost:3000/api/stations").done(this.loopThroughStations);
};

App.mapSetup = function() {
  console.log("hi");
  this.$main.empty().html(`<div id="mapCanvas"></div>`);
  let mapCanvas = document.getElementById('mapCanvas');

  let mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng(51.516178,-0.088369),
    styles: [{"featureType":"all","elementType":"geometry","stylers":[{"color":"#ecdcc3"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"gamma":0.01},{"lightness":20}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"saturation":-31},{"lightness":-33},{"weight":2},{"gamma":0.8}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#776340"},{"invert_lightness":true}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#776340"}]},{"featureType":"administrative.province","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"visibility":"on"}]},{"featureType":"administrative.neighborhood","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":30},{"saturation":30}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape.natural","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"landscape.natural.terrain","elementType":"all","stylers":[{"visibility":"on"},{"color":"#e5d8c3"},{"lightness":"-6"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"saturation":20}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"lightness":20},{"saturation":-20}]},{"featureType":"road","elementType":"all","stylers":[{"weight":"1"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":10},{"saturation":-30}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#8f8470"},{"lightness":"0"},{"weight":"1"},{"invert_lightness":true}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"saturation":25},{"lightness":25},{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"weight":"2.00"},{"invert_lightness":true}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"weight":"2"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit.line","elementType":"all","stylers":[{"visibility":"on"},{"invert_lightness":true},{"lightness":"37"}]},{"featureType":"transit.station.airport","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.bus","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.rail","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.rail","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b0b0b0"}]},{"featureType":"transit.station.rail","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.rail","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"lightness":-20},{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"lightness":"28"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.icon","stylers":[{"visibility":"off"}]}]
  };

  this.map = new google.maps.Map(mapCanvas, mapOptions);
  this.getStations();
};

// --------
//  AUTH
// --------

App.homepage = function() {
  this.$main.html(`
      <h1>Website Title</h1>
      <h3>Caption</h3>
    `);
};

App.loggedInState = function(){
  $(".loggedOut").hide();
  $(".loggedIn").show();
  this.mapSetup();
};

App.loggedOutState = function(){
  $(".loggedOut").show();
  $(".loggedIn").hide();
  this.homepage();
};

App.setToken = function(token){
  return window.localStorage.setItem("token", token);
};

App.getToken = function(){
  return window.localStorage.getItem("token");
};

App.removeToken = function(){
  return window.localStorage.clear();
};

App.setRequestHeader = function(xhr, settings) {
  return xhr.setRequestHeader("Authorization", `Bearer ${this.getToken()}`);
};

App.ajaxRequest = function(url, method, data, callback){
  return $.ajax({
    url,
    method,
    data,
    beforeSend: this.setRequestHeader.bind(this)
  })
  .done(callback)
  .fail(data => {
    console.log(data);
  });
};

App.handleForm = function(){
  event.preventDefault();

  let url    = `${App.apiUrl}${$(this).attr("action")}`;
  let method = $(this).attr("method");
  let data   = $(this).serialize();

  $(this).trigger("reset");

  return App.ajaxRequest(url, method, data, (data) => {
    if (data.token) App.setToken(data.token);
    App.loggedInState();
  });
};

App.logout = function() {
  event.preventDefault();
  this.removeToken();
  this.loggedOutState();
};

App.register = function() {
  if (event) event.preventDefault();
  this.$form.html(`

<h2>Register</h2>
  <form method="post" action="/register">
      <div class="form-group">
      <input class="form-control" type="text" name="user[username]" placeholder="Username">
      </div>
      <div class="form-group">
      <input class="form-control" type="email" name="user[email]" placeholder="Email">
      </div>
      <div class="form-group">
      <input class="form-control" type="password" name="user[password]" placeholder="Password">
      </div>
      <div class="form-group">
      <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Password
      Confirmation">
      </div>
      <input class="btn btn-primary" type="submit" value="Register">
    </form>
    `);
  };

  App.login = function() {
    event.preventDefault();
    this.$form.html(`
      <h2>Login</h2>
      <form method="post" action="/login">
        <div class="form-group">
        <input class="form-control" type="email" name="email" placeholder="Email">
        </div>
        <div class="form-group">
        <input class="form-control" type="password" name="password" placeholder="Password">
        </div>
        <input class="btn btn-primary" type="submit" value="Login">
      </form>
      `);
    };

    App.init = function() {
      this.apiUrl = "http://localhost:3000/api";
      this.$form  = $('.form-container');
      this.$main  = $("main");

      this.homepage();

      $(".register").on("click", this.register.bind(this));
      $(".login").on("click", this.login.bind(this));
      $(".logout").on("click", this.logout.bind(this));
      this.$form.on("submit", "form", this.handleForm);

      if (this.getToken()) {
        this.loggedInState();
      } else {
        this.loggedOutState();
      }
    };

    $(App.init.bind(App));
