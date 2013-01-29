var container = L.DomUtil.get('quake'),
    map = L.map(container).setView([-43.6, 172.3], 10);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

d3.json(container.dataset.source, function(collection) {
    var hex_layer = L.hexLayer(collection);
    map.addLayer(hex_layer);
});
