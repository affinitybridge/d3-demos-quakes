L.HexLayer = L.Class.extend({
    includes: L.Mixin.Events,

    options: {
        minZoom: 0,
        maxZoom: 18,
        padding: 100,
        radius: 10,
        classes: 9
    },

    initialize: function (data, options) {
        var options = L.setOptions(this, options);
        this._layout = d3.hexbin().radius(this.options.radius);
        this._data = data;
        this._levels = {};
    },

    onAdd: function (map) {
        this._map = map;

        // create a container div for tiles
        this._initContainer();

        // set up events
        map.on({
            'viewreset': this._resetCallback,
            'moveend': this._update
        }, this);

        this._reset();
        this._update();
    },

    onRemove: function (map) {
        this._container.parentNode.removeChild(this._container);

        map.off({
            'viewreset': this._resetCallback,
            'moveend': this._update
        }, this);

        this._container = null;
        this._map = null;
    },

    _initContainer: function () {
        var zoom = this._map.getZoom(),
            overlayPane = this._map.getPanes().overlayPane;

        if (!this._container || overlayPane.empty) {
            this._container = d3.select(overlayPane)
                .append('svg').attr('class', 'leaflet-layer leaflet-zoom-hide');
        }
    },

    _resetCallback: function (e) {
        this._reset();
    },

    _reset: function () {
        this._initContainer();
    },

    _update: function () {

        if (!this._map) { return; }

        var zoom = this._map.getZoom();

        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
            return;
        }

        var padding = this.options.padding,
            bounds = this._translateBounds(d3.geo.bounds(this._data));
            width = bounds.getSize().x + (2 * padding),
            height = bounds.getSize().y + (2 * padding),
            margin_top = bounds.min.y - padding,
            margin_left = bounds.min.x - padding;

        this._layout.size([width, height]);
        this._container.attr("width", width).attr("height", height)
            .style("margin-left", margin_left + "px").style("margin-top", margin_top + "px");

        if (!(zoom in this._levels)) {
            this._levels[zoom] = this._container.append("g").attr("class", "YlOrRd zoom-" + zoom);
            this._createHexagons(this._levels[zoom]);
            this._levels[zoom].attr("transform", "translate(" + -margin_left + "," + -margin_top + ")");
        }
        this._setLevel(zoom);
    },

    _setLevel: function (zoom) {
        if (this._currentLevel) {
            this._currentLevel.style("display", "none");
        }
        this._currentLevel = this._levels[zoom];
        this._currentLevel.style("display", "inline");
    },

    _createHexagons: function (container) {
        var layout = this._layout,
            data = this._data.features.map(function (d) {
                return this._project(d.geometry.coordinates);
            }, this),
            bins = layout(data),
            hexagons = container.selectAll(".hexagon").data(bins);

        var total_classes = this.options.classes,
            max = d3.max(bins, function (d) { return d.length; }),
            scale = d3.scale.quantize()
                .domain([max, 0])
                .range(d3.range(total_classes));

        // Create hexagon elements when data is added.
        hexagons.enter()
            .append("path")
            .attr("class", "hexagon")
            .attr("stroke", "#800026")
            .attr("class", function (d) {
                var num = ((total_classes - 1) - scale(d.length)),
                    c = 'q' + num + "-" + total_classes;
                return 'hexagon ' + c;
            });

        // Position hexagon elements.
        hexagons.attr("d", function (d) {
            // Setting "M" ensures each hexagon is drawn at its correct location.
            return "M" + d.x + "," + d.y + layout.hexagon();
        });
    },

    _project: function (x) {
        var point = this._map.latLngToLayerPoint([x[1], x[0]]);
        return [point.x, point.y];
    },

    _translateBounds: function (d3_bounds) {
        var nw = this._project([d3_bounds[0][0], d3_bounds[1][1]]),
            se = this._project([d3_bounds[1][0], d3_bounds[0][1]]);
        return L.bounds(nw, se);
    }

});

L.hexLayer = function (data, options) {
    return new L.HexLayer(data, options);
};
