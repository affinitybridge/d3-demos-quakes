var container = L.DomUtil.get('quake'),
    map = L.map(container).setView([-43.6, 172.3], 10);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

d3.json(container.dataset.source, function(collection) {
    var hex_layer = L.hexLayer(collection, {
            applyStyle: hex_style
        });

    map.addLayer(hex_layer);
});

function hex_style (hexagons) {
    var classes = this._container.attr("class");
    this._container.attr("class", classes + " YlOrRd");

    var num_classes = 9,
        max = d3.max(hexagons.data(), function (d) { return d.length; }),
        scale = d3.scale.quantize()
            .domain([max, 0])
            .range(d3.range(num_classes));

    hexagons.attr("stroke", "#800026")
        .attr("class", function (d) {
            var num = ((num_classes - 1) - scale(d.length)),
            c = 'q' + num + "-" + num_classes;
            return 'hexagon ' + c;
        });
}
