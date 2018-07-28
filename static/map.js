
proj4.defs("nzthing", "+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

var map = L.map('map', {}).setView([-43.80526, 170.86658], 6);
L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: 'Basemap &copy; OpenStreetMap and contributors'
}).addTo(map);
map.attributionControl.setPrefix('');

fetch("./sightings.csv")
  .then(function (res) { return res.text(); })
  .then(function (csvtext) {
    var markers = L.markerClusterGroup({
      showCoverageOnHover: false
    });
    map.addLayer(markers);

    var rows = Papa.parse(csvtext, { header: true }).data;

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];

      L.Proj.geoJson({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [row.Easting * 1, row.Northing * 1]
        },
        crs: {
          type: "name",
          properties: {
            name: "nzthing"
          }
        },
        properties: row
      },
      {
        onEachFeature: function (feature, layer) {
          var popuphtml = '';
          var props = feature.properties;
          var dformat = props.Date.replace('/', '.');
          var parts = dformat.match(/(\d+)/g);
          var nzdate = new Date(parts[2], parts[1]-1, parts[0]);

          popuphtml += '<h3>' + nzdate.toDateString() + '</h3>';
          popuphtml += '<em>' + props["Specific Location"] + ' | ' + props["General Location"] + '</em>';
          popuphtml += '<ul>';
          var activities = [];
          if (props.Calls * 1) {
            activities.push('Calls');
          }
          if (props.Grubbing * 1) {
            activities.push('Grubbing');
          }
          if (props["Organ song"] * 1) {
            activities.push('Organ song');
          }
          if (props["Wattles?"] * 1) {
            activities.push('Wattles');
          }
          if (activities.length) {
            popuphtml += '<li><strong>Notes</strong>: ' + activities.join(', ') + '</li>';
          }
          popuphtml += '<li><strong>Birds</strong>: ' + props["Est # birds"] + '</li>';
          if (props["Distance "]) {
            popuphtml += '<li><strong>Distance</strong>: ' + props["Distance "] + '</li>';
          }
          popuphtml += '<li><strong>Experience</strong>: ' + props["Obs experience"] + '</li>';
          popuphtml += '</ul>';
          popuphtml += '<p class="desc">' + props.Descriptions + '</p>';

          layer.bindPopup(popuphtml);
          markers.addLayer(layer);
          //console.log(feature.properties);
        }
      });
    }
  });
