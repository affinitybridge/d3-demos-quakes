(function () {
    var max, scale,
        classes = 9,
        scheme = colorbrewer["YlOrRd"][classes],
        container = L.DomUtil.get('quake'),
        map = L.map(container).setView([-43.6, 172.3], 10);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Async call for data. Source URL is loaded from container element's
    // 'data-source' attribute.
    d3.json(container.dataset.source, function(collection) {
        // When data arrives, create leaflet layer with custom style callback.
        L.hexLayer(collection, {
            applyStyle: hex_style
        }).addTo(map);
    });

    /**
     * Hexbin style callback.
     *
     * Determines a quantize scale (http://bl.ocks.org/4060606) based on the
     * map's initial data density (which is based on the initial zoom level)
     * and applies a colorbrewer (http://colorbrewer2.org/) colour scheme
     * accordingly.
     */
    function hex_style(hexagons) {
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
