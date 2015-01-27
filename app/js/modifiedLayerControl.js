/*
 * L.Control.ModifiedLayers is a control to allow users to switch between different layers on the map.
 */

L.Control.ModifiedLayers = L.Control.extend({
  options: {
    collapsed: true,
    position: 'topright',
    autoZIndex: true
  },

  initialize: function (baseLayers, overlays, options) {
    console.log('ModifiedLayers is initializing');
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
    console.log('modifiedLayers is addToDiv');
    this._map = map;

    var pos = this.getPosition();
    var container = this._container = document.getElementById('divMapInfo');
    this.onAdd(map);

    console.log(container);
    console.log(pos);

    L.DomUtil.addClass(container, 'leaflet-control');

    return this;
  },


  onAdd: function (map) {
    console.log('ModifiedLayers is onAdd');
    this._initLayout();
    this._update();

    map
        .on('layeradd', this._onLayerChange, this)
        .on('layerremove', this._onLayerChange, this);

    return this._container;
  },

  onRemove: function (map) {
    console.log('ModifiedLayers is onRemove');
    map
        .off('layeradd', this._onLayerChange, this)
        .off('layerremove', this._onLayerChange, this);
  },

  addBaseLayer: function (layer, name) {
    console.log('ModifiedLayers is addBaseLayer');
    this._addLayer(layer, name);
    this._update();
    return this;
  },

  addOverlay: function (layer, name) {
    console.log('ModifiedLayers is addOverlay');
    this._addLayer(layer, name, true);
    this._update();
    return this;
  },

  removeLayer: function (layer) {
    console.log('ModifiedLayers is removeLayer');
    var id = L.stamp(layer);
    delete this._layers[id];
    this._update();
    return this;
  },

  _initLayout: function () {
    console.log('ModifiedLayers is _initLayout');
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
    console.log(form);

    L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');

    this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
    this._separator = L.DomUtil.create('div', className + '-separator', form);
    this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

    container.appendChild(form);
    console.log(container);
  },

  _addLayer: function (layer, info, name, overlay) {
    console.log('ModifiedLayers is _addLayer');
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
    console.log('ModifiedLayers is _update');
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

      this._addInfoDiv(obj);

      overlaysPresent = overlaysPresent || obj.overlay;
      baseLayersPresent = baseLayersPresent || !obj.overlay;
    }

    this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
  },

  _onLayerChange: function (e) {
    console.log('ModifiedLayers is _onLayerChange');
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
    console.log('ModifiedLayers is _createRadioElement');
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





    label.appendChild(input);
    label.appendChild(name);







    var container = obj.overlay ? this._overlaysList : this._baseLayersList;
    container.appendChild(label);
    container.appendChild(infoDiv);


    return label;
  },

  _addInfoDiv: function(obj){
    console.log(obj);
  },

  _onInputClick: function () {
    console.log('ModifiedLayers is _onInputClick');
    var i, input, obj,
        inputs = this._form.getElementsByTagName('input'),
        inputsLen = inputs.length;

    this._handlingClick = true;

    for (i = 0; i < inputsLen; i++) {
      input = inputs[i];
      obj = this._layers[input.layerId];
      console.log(obj);

      if (input.checked && !this._map.hasLayer(obj.layer)) {
        console.log(obj.layer);
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
