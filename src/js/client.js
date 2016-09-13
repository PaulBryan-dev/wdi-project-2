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
  let latlng = new google.maps.LatLng(station.lat, station.lng);
  let marker = new google.maps.Marker({
    position: latlng,
    map: this.map,
    icon: "./src/images/icon.png"
  });
  this.addInfoWindowForStation(station, marker);
};

App.loopThroughStations = (data) => {
  $.each(data.stations, (index, station) => {
    setTimeout(() => {
      App.createMarkerForStation(station);
    }, index * 500);
  });
};

App.getStations = function() {
  $.get("http://localhost:3000/api/stations").done(this.loopThroughStations);
};

App.mapSetup = function() {
  this.$main.empty().html(`<div id="mapCanvas"></div>`);
  let mapCanvas = document.getElementById('mapCanvas');

  let mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(51.516178,-0.088369),
    mapTypeId: google.maps.MapTypeId.ROADMAP
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
