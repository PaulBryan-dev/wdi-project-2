const App = App || {};

// --------
//   MAP
// --------

App.addInfoWindowForStation = function(station, marker) {
  google.maps.event.addListener(marker, 'click', () => {
    if (typeof this.infowindow != "undefined") this.infowindow.close();
    this.infowindow = new google.maps.InfoWindow({
      content: `<div id="infoWindow"><h2 class="windowName">${station.name}</h2><img class="windowPic" src="${station.image}"><p>${station.description}</p></div>`
    });
    this.infowindow.open(this.map, marker);
    this.map.setCenter(marker.getPosition());
    this.map.panBy(0,-180);
  });
};

App.createMarkerForStation = function(station) {
  let latlng = new google.maps.LatLng(station.lat, station.lng);
  let marker = new google.maps.Marker({
    position: latlng,
    map: this.map,
    icon: "./images/train-marker.png",
    animation: "drop"
  });
  this.addInfoWindowForStation(station, marker);
};

App.loopThroughStations = (data) => {
  $.each(data.stations, (index, station) => {
    App.createMarkerForStation(station);
  });
};

App.getStations = function() {
  $.get("http://localhost:3000/api/stations").done(this.loopThroughStations);
};

App.mapSetup = function() {
  this.$main.empty().html(`<div id="mapCanvas"></div>`);
  let mapCanvas = document.getElementById('mapCanvas');

  let mapOptions = {
    zoom: 10,
    center: new google.maps.LatLng(51.516178,-0.018369),
    styles: [{"elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#f5f5f2"},{"visibility":"on"}]},{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","stylers":[{"visibility":"off"}]},{"featureType":"poi.school","stylers":[{"visibility":"off"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#ffffff"},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"visibility":"simplified"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"color":"#ffffff"},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#71c8d4"}]},{"featureType":"landscape","stylers":[{"color":"#e5e8e7"}]},{"featureType":"poi.park","stylers":[{"color":"#8ba129"}]},{"featureType":"road","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.sports_complex","elementType":"geometry","stylers":[{"color":"#c7c7c7"},{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#a0d3d3"}]},{"featureType":"poi.park","stylers":[{"color":"#91b65d"}]},{"featureType":"poi.park","stylers":[{"gamma":1.51}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","stylers":[{"visibility":"simplified"}]},{"featureType":"road"},{"featureType":"road"},{},{"featureType":"road.highway"}]
  };

  this.map = new google.maps.Map(mapCanvas, mapOptions);
  this.getStations();
};



App.homepage = function() {
  this.$main.html(`
    <div class="homepage">
      <div class="centered">
      <div class="logo">
        <h2 class="one">SIX</h2>
        <h2 class="two">FEET</h2>
      </div>
      <h2>Where Tube Stations find their peace</h2>
      <h4>Please login or register to access the map</h4>
      </div>
    </div>

    `);
  };

  App.loggedInState = function(){
    $(".loggedOut").hide();
    $(".loggedIn").show();
    $(".form-container").hide();
    this.mapSetup();
  };

  App.loggedOutState = function(){
    $(".loggedOut").show();
    $(".loggedIn").hide();
    $(".form-container").empty().show();
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
      <form class="form-inline" method="post" action="/register">
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
      <input class="form-control" type="password" name="user[passwordConfirmation]" placeholder="Confirm Password">
      </div>
      <input class="btn btn-primary" type="submit" value="Register">
      </form>
      `);
    };

    App.login = function() {
      event.preventDefault();
      this.$form.html(`
        <form class="form-inline" method="post" action="/login">
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
