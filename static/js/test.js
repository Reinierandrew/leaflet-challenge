// create url query
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(url).then(function (data) {
    // Once we get a response, the log the response in the console and send data.features object to the createFeatures function.
    console.log(data.features);
    createFeatures(data.features);
  });

//  set the marker colour options based on depth 
  function chooseColor(depth) {
    if (depth <= 10) 
    return "#FFFE9A";
    else if (depth <=30) 
    return "#F3A333";
    else if (depth <=50)
    return "#F16821";
    else if (depth <=70)
    return "#C70D3A";
    else if (depth <=90)
    return "#9D0B0B";
    else return "#000";
  }

  // start the marker creation function
  function createMarkers(feature, latlng) {

    // Set marker options based on the magnitude
    let magnitude = feature.properties.mag;
    let markerOptions = {
      radius: magnitude * 2,
      fillColor: chooseColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 1
    };
  
    // Create the marker
    let marker = L.circleMarker(latlng, markerOptions);
    return marker;
  }

 // start the earthquake data function
function createFeatures(earthquakeData) {

  // Give each feature a popup that describes the place, location, depth and magnitude of the earthquake
function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Latitude:${feature.geometry.coordinates[1]}<br>Longitude:${feature.geometry.coordinates[0]}<br>Depth:${feature.geometry.coordinates[2]}<br>Magnitude:${feature.properties.mag}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createMarkers
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

    function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [0, 105],
      zoom: 2.5,
      layers: [street, earthquakes]
    });

    // Set up the legend.
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend");
        limits = [10, 30, 50, 70, 90];
        labels = [];
    
        for (var i = 0; i < limits.length; i++) {
          div.innerHTML +=
              '<i style="background:' + chooseColor(limits[i] + 1) + '"></i> ' +
              limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
      }
    return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);

    // Create a layer control.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
  }
