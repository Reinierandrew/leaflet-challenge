// Store our API endpoint as queryUrl.
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson/";
// let url ="https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-03-15&endtime=2023-03-26&minmagnitude=1";
let url ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";
console.log("access_key",access_key)
// satellite layer
let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style: 'mapbox/satellite-v9',
    access_token: access_key
});
// outdoor layer
let outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style: 'mapbox/outdoors-v12',
    access_token: access_key
});
// street layer
let streets = L.tileLayer('https://api.mbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style: 'mapbox/streets-v12',
    access_token: access_key
});

let myMap = L.map("map", {
    center: [-7.59799, 107.31335],
    zoom: 3,
    layers: [satellite]
});

let basemaps = {
    "satellite": satellite,
    "outdoors": outdoors,
    "streets": streets
};

let earthquakeslayer = new L.LayerGroup();
let tectonicplateslayer = new L.LayerGroup();

let overlaymaps = {
    "Earthquakes": earthquakeslayer,
    "Tectonic Plates": tectonicplateslayer
};

L.control.layers(basemaps, overlaymaps, {
    collapsed: false
    }).addTo(myMap);

// create colour function based on depth to be used for cicles and legend
function colour(depth) {
    if (depth < 10) return "#efa4ab";
    else if (depth < 30) return "#c05d5d";
    else if (depth < 50) return "#6f4393";
    else if (depth < 70) return "#671870";
    else if (depth < 90) return "#0d2f48";
    else return "#030f28";
    }
// console.log("depth", feature.geometry.coordinates[2])
function styleInfo(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        radius: feature.properties.mag*2,
        fillColor: colour(feature.geometry.coordinates[2]),
        // color: "#000000",
        stroke: false,
        // weight: 0.5
    };
}

d3.json(url).then(function (earthquakedata) {

    console.log(earthquakedata);

    // Create  the earthquakes layer (circles and pop up) and add to Mymap
    L.geoJson(earthquakedata, {
        pointToLayer: function (feature, latlng) {
            // console.log(earthquakedata);
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`
            <h2>${feature.properties.place}</h2><hr>
            <p><h3>Magnitude: ${feature.properties.mag}</h3></p>
            <p><h4>Depth: ${feature.geometry.coordinates[2]}</h4></p>
            <p>Date: ${new Date(feature.properties.time)}</p>`);
            }
    }).addTo(earthquakeslayer);
    // add the earthquakes layer to Mymap
    earthquakeslayer.addTo(myMap);

    // create the tectonic layer and add to Mymap
    d3.json("https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json").then(function(data) {
        L.geoJson(data, {
            color: "",
            weight: 3
        }).addTo(tectonicData);

        tectonicData.addTo(map);

    });

   // Add legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        limits = [10, 30, 50, 70, 90];
        // labels = [];

        for (var i = 0; i < limits.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colour(limits[i] + 1) + '"></i> ' +
                limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);


    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {
        L.geoJson(data, {
            color: "#f80000",
            weight: 0.8
        }).addTo(tectonicplateslayer);

        tectonicplateslayer.addTo(map);
    });
});



