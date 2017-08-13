(function (leaflet) {

'use strict';

var MAP_ID = 'map';
var START_COORDINATES = [53.3498, -6.2603];
var START_ZOOM_LEVEL = 14;

var dublinSmallAreaBoundaries = {};
var dublinSaps = {};

var layer = new leaflet.StamenTileLayer('terrain');
var map = leaflet.map(MAP_ID).setView(START_COORDINATES, START_ZOOM_LEVEL);

map.addLayer(layer);

Promise.all([
    fetchDublinSmallAreaBoundaries(),
    fetchDublinSaps()
]).then(function (datasets) {
    dublinSmallAreaBoundaries = datasets[0];
    dublinSaps = datasets[1].reduce(function (acc, sapsRow) {
        if (!acc[sapsRow.GEOGID]) {
            var featureId = sapsRow.GEOGID.replace('SA2017_', '');
            acc[featureId] = sapsRow;

            var percentageSameAddress = sapsRow.T2_3SA * 100 / sapsRow.T2_3T;

            return acc;
        } else {
            console.warn('Duplicate GEOGID', sapsRow.GEOGID);
        }
    }, {});

    leaflet.geoJson(dublinSmallAreaBoundaries, {
        style: styleFeature,
        onEachFeature: onEachSmallAreaFeature
    }).addTo(map);
});

function fetchDublinSmallAreaBoundaries() {
    return fetch('dublin.geojson').then(function (response) {
        return response.json();
    });
}

function fetchDublinSaps() {
    return fetch('dublin-saps.json').then(function (response) {
        return response.json();
    });
}

function styleFeature(feature) {
    var percentageSameAddress = dublinSaps[feature.properties.SMALL_AREA].T2_3SA /
                                dublinSaps[feature.properties.SMALL_AREA].T2_3T *
                                100;

    return {
        weight: 1,
        color: '#555555',
        fillColor: getColor(percentageSameAddress),
        fillOpacity: 0.7
    };
}

function getColor(percentage) {
    return percentage > 85 ? '#eff3ff' :
           percentage > 70 ? '#bdd7e7' :
           percentage > 55 ? '#6baed6' :
           percentage > 40 ? '#3182bd' :
                             '#08519c';
}

function onEachSmallAreaFeature(smallAreaFeature, layer) {
    layer.bindPopup('<div>' +
        '<p><strong>Small Area ID:</strong> ' + smallAreaFeature.properties.SMALL_AREA + '</p>' +
        '<p><strong>Same address:</strong> ' + dublinSaps[smallAreaFeature.properties.SMALL_AREA].T2_3SA + '</p>' +
        '<p><strong>Elsewhere in county:</strong> ' + dublinSaps[smallAreaFeature.properties.SMALL_AREA].T2_3EC + '</p>' +
        '<p><strong>Elsewhere in Ireland:</strong> ' + dublinSaps[smallAreaFeature.properties.SMALL_AREA].T2_3EI + '</p>' +
        '<p><strong>Outside Ireland:</strong> ' + dublinSaps[smallAreaFeature.properties.SMALL_AREA].T2_3OI + '</p>' +
        '<p><strong>Total:</strong> ' + dublinSaps[smallAreaFeature.properties.SMALL_AREA].T2_3T + '</p>' +
    '</div>');
}

})(L);
