(function () {
    var max, scale,
        classes = 9,
        scheme = colorbrewer["YlOrRd"][classes],
        container = L.DomUtil.get('quake'),
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
        // Maintain a density scale relative to initial zoom level.
        if (!(max && scale)) {
            max = d3.max(hexagons.data(), function (d) { return d.length; });
            scale = d3.scale.quantize()
                    .domain([0, max])
                    .range(d3.range(classes));
        }

        hexagons
            .attr("stroke", scheme[classes - 1])
            .attr("fill", function (d) {
                return scheme[scale(d.length)];
            });
    }
}());
