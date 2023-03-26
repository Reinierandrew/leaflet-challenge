// Use 3 datasets: earthquakes this month over 4.5, tectonic plates
// and larger than 6.5 magnitude for whole of 2023 to date

let url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-03-01&endtime=2023-03-31&minmagnitude=4.5";
console.log("access_key", access_key)

d3.json(url).then(function (earthquakedata) {
    console.log(earthquakedata);

    //satellite layer
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
    // dark layer
    let dark = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        style: 'mapbox/dark-v11',
        access_token: access_key
    });

    let myMap = L.map("map", {
        center: [-12.59799, 107.31335],
        zoom: 3,
        layers: [outdoors],
    });


    let basemaps = {
        "Terrain": outdoors,
        "Satellite": satellite,
        "Dark": dark,
    };

    let earthquakeslayer = new L.LayerGroup();
    let tectonicplateslayer = new L.LayerGroup();
    let largelayer = new L.LayerGroup();

    let overlaymaps = {
        "March '23 over 4.5": earthquakeslayer,
        "Tectonic Plates": tectonicplateslayer,
        "All '23 over 6.5": largelayer
    };

    L.control.layers(basemaps, overlaymaps, {
        collapsed: false
    }).addTo(myMap)


// create colour function based on depth to be used for cicles AND legend
    function colour(depth) {
        if (depth < 10) return "#fccbd0";
        else if (depth < 30) return "#fcecae";
        else if (depth < 50) return "#f34a44";
        else if (depth < 70) return "#671870";
        else if (depth < 90) return "#0d2f48";
        else return "#030f28";
    }

    //style for circles
    function style_all(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            radius: feature.properties.mag * 2,
            fillColor: colour(feature.geometry.coordinates[2]),
            // color: "#000000",
            stroke: false,
            // weight: 0.5
        };
    }

    //style for large earthquake circles
    function style_large(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            radius: feature.properties.mag * 2,
            fillColor: "#ff0000",
            // color: "#000000",
            stroke: false,
            // weight: 0.5
        };
    }

    // Create  the earthquakes layer (circles and pop up) and add to Mymap
    L.geoJson(earthquakedata, {
        pointToLayer: function (feature, latlng) {
            // console.log(earthquakedata);
            return L.circleMarker(latlng);
        },
        style: style_all,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`
            <h2>${feature.properties.place}</h2><hr>
            <p><h3>Magnitude: ${feature.properties.mag}</h3></p>
            <p><h4>Depth: ${feature.geometry.coordinates[2]}</h4></p>
            <p>Date: ${new Date(feature.properties.time)}</p>`);
        }
    }).addTo(earthquakeslayer);
    // add the earthquakes layer to Mymap
    earthquakeslayer.addTo(myMap);

    // Create  the tectonic plates layer
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) {
        L.geoJson(data, {
            color: "#f80000",
            weight: 0.8
        }).addTo(tectonicplateslayer);
    });

    // 2023 largest earthquakeslayer and add to Mymap
    d3.json("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-01-01&endtime=2023-12-31&minmagnitude=6.5").then(function (large) {

        L.geoJson(large, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng);
            },
            style: style_large,
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`
            <h2>${feature.properties.place}</h2><hr>
            <p><h3>Magnitude: ${feature.properties.mag}</h3></p>
            <p><h4>Depth: ${feature.geometry.coordinates[2]}</h4></p>
            <p>Date: ${new Date(feature.properties.time)}</p>`);
            }
        }).addTo(largelayer);
    });


    // Add legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        depthcategories = [10, 30, 50, 70, 90];

        div.innerHTML += "<h8>Depth in m</h8><hr>"

        for (var i = 0; i < depthcategories.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colour(depthcategories[i] + 1) + '"></i>' +
                depthcategories[i] + (depthcategories[i + 1] ? '&ndash;' + depthcategories[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

});



