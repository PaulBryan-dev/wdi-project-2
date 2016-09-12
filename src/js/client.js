const googleMap = googleMap || {};

const GeoMarker = new GeolocationMarker(googleMap);

googleMap.addInfoWindowForStation = function(station, marker) {
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

googleMap.createMarkerForStation = function(station) {
  let latlng = new google.maps.LatLng(station.lat, station.lng);
  let marker = new google.maps.Marker({
    position: latlng,
    map: this.map,
    icon: "./src/images/icon.png"
  });

  this.addInfoWindowForStation(station, marker);
};

googleMap.loopThroughStations = (data) => {
  $.each(data.stations, (index, station) => {
    setTimeout(() => {
      googleMap.createMarkerForStation(station);
    }, index * 500);
  });
};

googleMap.getStations = function() {
  $.get("http://localhost:3000/api/stations").done(this.loopThroughStations);
};

googleMap.mapSetup = function() {
  let canvas = document.getElementById('map-canvas');

  let mapOptions = {
    minZoom: 5, maxZoom: 15,
    zoom: 12,
    center: new google.maps.LatLng(51.516178,-0.088369),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  this.map = new google.maps.Map(canvas, mapOptions);
  this.getStations();
};

$(googleMap.mapSetup.bind(googleMap));
