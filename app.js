(function (leaflet) {

'use strict';

var MAP_ID = 'map';
var START_COORDINATES = [53.3498, -6.2603];
var START_ZOOM_LEVEL = 14;

var dublinSmallAreaBoundaries = {};

var layer = new leaflet.StamenTileLayer('terrain');
var map = leaflet.map(MAP_ID).setView(START_COORDINATES, START_ZOOM_LEVEL);

map.addLayer(layer);

Promise.all([
    fetchDublinSmallAreaBoundaries()
]).then(function (datasets) {
    dublinSmallAreaBoundaries = datasets[0];

    leaflet.geoJson(dublinSmallAreaBoundaries, {
        onEachFeature: onEachSmallAreaFeature
    }).addTo(map);
});

function fetchDublinSmallAreaBoundaries() {
    return fetch('dublin.geojson').then(function (response) {
        return response.json();
    });
}

function onEachSmallAreaFeature(smallAreaFeature, layer) {
    layer.bindPopup('<div>' +
        '<p><strong>Small Area ID:</strong> ' + smallAreaFeature.properties.SMALL_AREA + '</p>' +
    '</div>');
}

})(L);
