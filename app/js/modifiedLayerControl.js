/*
 * L.Control.ModifiedLayers is a control to allow users to switch between different layers on the map.
 */

L.Control.ModifiedLayers = L.Control.extend({
  options: {
    collapsed: true,
    position: 'topright',
    autoZIndex: true,
    idTag: 'tr'
  },

  initialize: function (baseLayers, overlays, options) {
    L.setOptions(this, options);

    this._layers = {};
    this._lastZIndex = 0;
    this._handlingClick = false;

    for (var i in baseLayers) {
      this._addLayer(baseLayers[i], i);
    }

    for (i in overlays) {
      this._addLayer(overlays[i].testLayer, overlays[i].layerInfo, i, true);
    }
  },

  addToDiv: function (map) {
    this._map = map;
    this._mapHighlight = L.geoJson(null).addTo(this._map);

    var pos = this.getPosition();
    var container = this._container = document.getElementById('divMapInfo');
    this.onAdd(map);

    L.DomUtil.addClass(container, 'leaflet-control');

    return this;
  },


  onAdd: function (map) {
    this._initLayout();
    this._update();

    map
        .on('layeradd', this._onLayerChange, this)
        .on('layerremove', this._onLayerChange, this);

    return this._container;
  },

  onRemove: function (map) {
    map
        .off('layeradd', this._onLayerChange, this)
        .off('layerremove', this._onLayerChange, this);
  },

  addBaseLayer: function (layer, name) {
    this._addLayer(layer, name);
    this._update();
    return this;
  },

  addOverlay: function (layer, name) {
    this._addLayer(layer, name, true);
    this._update();
    return this;
  },

  removeLayer: function (layer) {
    var id = L.stamp(layer);
    delete this._layers[id];
    this._update();
    return this;
  },

  _initLayout: function () {
    var className = 'leaflet-control-layers',
        container = this._container;
        L.DomUtil.addClass(container, className);

    //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
    container.setAttribute('aria-haspopup', true);

    if (!L.Browser.touch) {
      L.DomEvent
        .disableClickPropagation(container)
        .disableScrollPropagation(container);
    } else {
      L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
    }

    var form = this._form = L.DomUtil.create('form', className + '-list');
    
    L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');

    this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
    this._separator = L.DomUtil.create('div', className + '-separator', form);
    this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

    container.appendChild(form);
  },

  _addLayer: function (layer, info, name, overlay) {
    var id = L.stamp(layer);

    this._layers[id] = {
      layer: layer,
      info: info,
      name: name,
      overlay: overlay
    };

    if (this.options.autoZIndex && layer.setZIndex) {
      this._lastZIndex++;
      layer.setZIndex(this._lastZIndex);
    }
  },

  _update: function () {
    if (!this._container) {
      return;
    }

    this._baseLayersList.innerHTML = '';
    this._overlaysList.innerHTML = '';

    var baseLayersPresent = false,
        overlaysPresent = false,
        i, obj;

    for (i in this._layers) {
      obj = this._layers[i];
      this._addItem(obj);

//      this._addInfoDiv(obj);

      overlaysPresent = overlaysPresent || obj.overlay;
      baseLayersPresent = baseLayersPresent || !obj.overlay;
    }

    this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
  },

  _onLayerChange: function (e) {
    var obj = this._layers[L.stamp(e.layer)];

    if (!obj) { return; }

    if (!this._handlingClick) {
      this._update();
    }

    var type = obj.overlay ?
      (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
      (e.type === 'layeradd' ? 'baselayerchange' : null);

    if (type) {
      this._map.fire(type, obj);
    }
  },

  // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
  _createRadioElement: function (name, checked) {
    var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
    if (checked) {
      radioHtml += ' checked="checked"';
    }
    radioHtml += '/>';

    var radioFragment = document.createElement('div');
    radioFragment.innerHTML = radioHtml;

    return radioFragment.firstChild;
  },

  _addItem: function (obj) {
    var label = document.createElement('label'),
        input,
        checked = this._map.hasLayer(obj.layer);


    if (obj.overlay) {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'leaflet-control-layers-selector';
      input.defaultChecked = checked;
    } else {
      input = this._createRadioElement('leaflet-base-layers', checked);
    }

    input.layerId = L.stamp(obj.layer);

    L.DomEvent.on(input, 'click', this._onInputClick, this);

    var name = document.createElement('span');
    name.innerHTML = ' ' + obj.name;

    infoDiv = document.createElement('div');
    infoDiv.id = obj.info.abbr + 'List';
    infoDiv.className = 'layerList';
    //class='layerList' id='{{:abbr}}

    L.DomEvent.on(infoDiv, 'click', this._onInfoClick, this);
    L.DomEvent.on(infoDiv, 'mouseover', this._onInfoMouseover, this);
    L.DomEvent.on(infoDiv, 'mouseout', this._onInfoMouseout, this);

    label.appendChild(input);
    label.appendChild(name);

    var container = obj.overlay ? this._overlaysList : this._baseLayersList;
    container.appendChild(label);
    container.appendChild(infoDiv);


    return label;
  },

//  _addInfoDiv: function(obj){
//    console.log('modifiedLayers is _addInfoDiv');
//    console.log(obj);
//  },

  _getNearestParent: function(node, tag){
    if (tag && node.parentNode.tagName === tag.toUpperCase()){
      return node.parentNode;
    }
    return this._getNearestParent(node.parentNode, tag);
  },

  _getInfoLatLng: function(node){
    return L.latLng({lat: node.getAttribute('lat'), lng: node.getAttribute('lng')});
  },

  _onInfoMouseover: function(e){
    if (e.target.className.indexOf('layerList') === -1){
      var actionNode = this._getNearestParent(e.target, this.options.idTag);
      var layerId = actionNode.id;
      var nodeLatLng = this._getInfoLatLng(actionNode);
      this._mapHighlight.clearLayers().addLayer(L.circleMarker(nodeLatLng, {radius: 20}));
    }
  },

  _onInfoMouseout: function(e){
    this._mapHighlight.clearLayers();
  },

  _onInfoClick: function(e){
    this._handlingClick = true;

    if (e.target.className.indexOf('layerList') === -1){
      var actionNode = this._getNearestParent(e.target, this.options.idTag);
      var layerId = actionNode.id;
      if(!this._map._layers[layerId]){
        this._map.addOneTimeEventListener('zoomend', function(){
          this._map._layers[layerId].openPopup();
        }, this);
        this._map.panTo(this._getInfoLatLng(actionNode));
        this._map.setZoom(11);
      }
      else {
        this._map.panTo(this._getInfoLatLng(actionNode));
        this._map._layers[layerId].openPopup();
      }
    }

    this._handlingClick = false;
    this._refocusOnMap();
  },

  _onInputClick: function () {
    var i, input, obj,
        inputs = this._form.getElementsByTagName('input'),
        inputsLen = inputs.length;

    this._handlingClick = true;

    for (i = 0; i < inputsLen; i++) {
      input = inputs[i];
      obj = this._layers[input.layerId];
      
      if (input.checked && !this._map.hasLayer(obj.layer)) {
        this._map.addLayer(obj.layer);

      } else if (!input.checked && this._map.hasLayer(obj.layer)) {
        this._map.removeLayer(obj.layer);
      }
    }

    this._handlingClick = false;

    this._refocusOnMap();
  }

});

L.control.modifiedLayers = function (baseLayers, overlays, options) {
  return new L.Control.ModifiedLayers(baseLayers, overlays, options);
};
