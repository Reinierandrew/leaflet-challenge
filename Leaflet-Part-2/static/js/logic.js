let url = "https://reinier.me/POA_2016_AUST.geojson"
d3.json(url).then(function (data) {
    // Once we get a response, the log the response in the console and send data.features object to the createFeatures function.
    console.log(data.features);
    createFeatures(data.features);
});