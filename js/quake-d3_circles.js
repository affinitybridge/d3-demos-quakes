var container = L.DomUtil.get('quake'),
    map = L.map(container).setView([-43.6, 172.3], 10);

L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: '<a href="http://content.stamen.com/dotspotting_toner_cartography_available_for_download">Stamen Toner</a>, <a href="http://www.openstreetmap.org/">OpenStreetMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 17
}).addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide"),
    padding = 100,
    color = d3.scale.log()
        .domain([5, 7, 15, 30])
        .range(["#d7191c", "#ffffbf", "#2c7bb6"])
        .interpolate(d3.interpolateHcl);

d3.json(container.dataset.source, function(collection) {
    var path = d3.geo.path().projection(project),
        bounds = d3.geo.bounds(collection),
        feature = g.selectAll("path")
            .data(collection.features)
            .enter()
            .append("path")
            .attr('stroke', get_color)
            .attr('fill', get_color);

    path.pointRadius(function (d) {
        var mag = d.properties.magnitude;
        return mag * mag;
    });

    map.on('viewreset', reset);
    reset();

    function reset() {
        var bottomLeft = project(bounds[0]),
            topRight = project(bounds[1]);

        svg .attr("width", topRight[0] - bottomLeft[0] + padding * 2)
            .attr("height", bottomLeft[1] - topRight[1] + padding * 2)
            .style("margin-left", bottomLeft[0] - padding + "px")
            .style("margin-top", topRight[1] - padding + "px");
        g   .attr("transform", "translate(" + -1 * (bottomLeft[0] - padding) + "," + -1 * (topRight[1] - padding) + ")");

        feature.attr('d', path)
            .attr("fill-opacity", 0.6)
            .attr("stroke-width", 0);
    }

    function project(x) {
        var point = map.latLngToLayerPoint([x[1], x[0]]);
        return [point.x, point.y];
    }

    function get_depth(d) {
        return d.properties.depth;
    }

    function get_color(d) {
        return d3.rgb(color(get_depth(d))).toString();
    }
});


