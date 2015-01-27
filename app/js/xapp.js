// citizenMap.js

var layers;

$.getJSON('data/config.json', function (data){
	layers = data;
});

function milesToMeters(inMiles){
	return (inMiles * 1609.34);
}

function metersToMiles(inMeters){
	return Math.round(inMeters * 0.000621373);
}

function distanceSort(a, b){
	return ((a.distance < b.distance)?-1:(a.distance > b.distance)?1:0);
}

function emptyArray(array){
	while (array.length>0){
		array.pop();
	}
}

$.templates({
	//iPhone, iPad Navigation use apple.com All Others use google.com 
	"navigation": (((navigator.platform.substring(0,2) === 'iP')?'https://maps.apple.com/maps':'https://maps.google.com/maps')+'?saddr={{: fromLat }},{{: fromLng }}&daddr={{: toLat }},{{: toLng }}'),
	"layerName": "<span id='{{: abbr }}icon'><img src='{{: legendIcon }}'></span><span title='{{: name }}'>{{: name }}</span>",
	"layerIcon": "<img src='{{:legendIcon}}'>",
	"layerListTable": "{{if ~layerCount(features) > 0}}<table class='table table-condensed table-hover'>{{for features tmpl=~layerListTmplName(abbr) /}}</table>{{/if}}",
	"testTable": "<tr><td>This</td><td>is a</td><td>table row.</td></tr>",
	"layerInfo": "<div class='panel-heading' role='tab' id='{{:abbr}}Header'><label class='panel-title'><input type='checkbox' class='leaflet-control-layers-selector' name='{{:abbr}}'><img src='{{: legendIcon }}'> {{: name }} <a data-toggle='collapse' data-parent='#divMapInfo' href='#collapse{{:abbr}}' aria-expanded='false' aria-controls='collapse{{:abbr}}'>Expand</a></label></div><div id='collapse{{:abbr}}' class='panel-collapse collapse' role='tabpanel' aria-labelledby='{{:abbr}}Header'><div class='panel-body layerList' id='{{:abbr}}List' ></div></div>",
	"layerInfoDiv": "<div class='layerList' id='{{:abbr}}List'></div>"
});

$.views.helpers({
	"layerCount": function(inFeatures){return inFeatures.length;},
	"layerListTmplName": function(inAbbr){return inAbbr + "List";}
});

function validateInput(inValues){
	var mapInfo = {};

	// force lat lng measurements to absolute values
	var tempLat = Math.abs(Number(inValues.lat));
	var tempLng = Math.abs(Number(inValues.lng));

		// check to see that the absolute value of longitude (87.4 - 91.6) is greater than the absolute value of latitude (36.9 - 42.5)
	if (tempLat > tempLng){
		var tmp = tempLat;
		tempLat = tempLng;
		tempLng = tmp;
	}

	// set map center to latitude and negative longitude for Illinois
	if (tempLat > 36.9 && tempLat < 42.5 && tempLng > 87.4 && tempLng < 91.6){
		mapInfo.mapCenter = L.latLng(tempLat, -tempLng);
		mapInfo.validMapCenter = true;
	}
	else {
		mapInfo.validMapcenter = false;
		mapInfo.mapCenter = L.latLng([40, -89.5]);
	}

	// Check Miles input and set map radius distance
	if (inValues.miles > 0 && inValues.miles <= 200){
		mapInfo.distance = milesToMeters(inValues.miles);
		mapInfo.validDistance = true;
	}
	else{
		mapInfo.distance = 307384;
		mapInfo.validDistance = false;
	}

	mapInfo.mapCircle = L.circle(
		mapInfo.mapCenter, 
		mapInfo.distance,{
			fill: false
	});
	mapInfo.mapBounds = mapInfo.mapCircle.getBounds();
	mapInfo.featureList = inValues.featureList;
	return mapInfo;
}

function parseQuery(inQuery){
	var returnValue = {
		featureList: []
	};
	if (typeof(inQuery.Lat)!=='undefined' && typeof(inQuery.Lon)!=='undefined'){
		returnValue.lat = Number(inQuery.Lat);
		returnValue.lng = Number(inQuery.Lon);
	}
	if (typeof(inQuery.Miles)!=='undefined'){
		returnValue.miles = Number(inQuery.Miles);
	}
	for (var layer in layers){
		if(inQuery[layers[layer].abbr]==='true'){
			returnValue.featureList.push(layer);
		}
	}

	return returnValue;
}

var citizenMap = function(inLayers, inQuery){
	var mapAttributes = validateInput(parseQuery(inQuery));
	var div = 'divMap';

	var map = L.map('divMap',{
		maxZoom: 17,
		minZoom: 6,
		center: L.latLng([40, -89.5]),
		zoom: 7,
		zoomControl: false
	});

	var zoomslider = L.control.zoomslider();
	zoomslider.addTo(map);

	var locationIcon = L.icon({
		iconUrl: 'img/location.png',
		iconRetinaUrl: 'img/location.png',
		iconSize: [30, 30],
		iconAnchor: [15,15]
	});

	/* Basemap Layers */
	var baseStreetMap = L.esri.Layers.basemapLayer("Topographic");
	var baseSatteliteMap = L.esri.Layers.basemapLayer("Imagery");
	var baseSatteliteWithTransportMap = new L.LayerGroup([
		L.esri.Layers.basemapLayer("Imagery"),
		L.esri.Layers.basemapLayer('ImageryTransportation')
		]);

	var baseLayers = {
		"Street Map": baseStreetMap,
		"Aerial Imagery": baseSatteliteMap,
		"Imagery with Streets": baseSatteliteWithTransportMap
	};

	// Set up Base Mapp
	map.addLayer(baseLayers["Street Map"]);

	var bindMarker = function(inTemplate){
		return function(geojson, marker){
			marker.bindPopup(inTemplate.render(geojson));
		};
	};

	var createMarker = function(inMarkerInfo){
		var inMarkerIcon = inMarkerInfo.markerIcon;
		if (typeof(inMarkerIcon)==='string'){
			returnCreateMarker = function(geojson, latLng){
				return L.marker(latLng, {icon: L.icon({
					iconUrl: inMarkerIcon,
					iconRetinaUrl: inMarkerIcon,
					iconSize: [32, 37],
					iconAnchor: [16, 37],
					popupAnchor:[0, -27]
				}),
				title: geojson.properties[inMarkerInfo.markerTitle],
				riseOnHover: true
			});   
			};
		}
		else {
			returnCreateMarker = function(geojson, latLng){
				iconUrls = inMarkerIcon.icons;
				titles = inMarkerIcon.titles;
				return L.marker(latLng, {icon: L.icon({
					iconUrl: iconUrls[geojson.properties[inMarkerIcon.variable]],
					iconRetinaUrl: iconUrls[geojson.properties[inMarkerIcon.variable]],
					iconSize: [32, 37],
					iconAnchor: [16, 37],
					popupAnchor:[0, -27]
				}),
				title: titles[geojson.properties[inMarkerIcon.variable]],
				riseOnHover: true
			});
			};
		}

		return returnCreateMarker;
	};

	// jsRender Converters Function Creator
	var buildConverterFunction = function(inData){
		return function(val){
			var codedData = inData;
			return codedData[val];
		};
	};

	// jsRender Converters Creator
	var buildTemplateConverter = function(inName, inData){
		var converterName = inName + 'Decode';
		$.views.converters(converterName, buildConverterFunction(inData));
		return converterName;
	};

	// jsRender Navigation Converter
	$.views.converters('navigationConverter', function(val){
		var fromLocation = mapAttributes.locationMarker.getLatLng();
		var navData = {
			fromLat: fromLocation.lat,
			fromLng: fromLocation.lng,
			toLat: val[1],
			toLng: val[0]
		};
		var navUrl = $.render.navigation(navData);
		return navUrl;
	});

	var buildFeatureLayerInfos = function(inLayerArray){
		var returnInfoArray = [];
		for (var record in inLayerArray){
			if (typeof(markerIcon) !== 'string'){
				buildTemplateConverter(inLayerArray[record].abbr, inLayerArray[record].markerIcon.titles);
			}
			var markerTemplate =  $.templates(inLayerArray[record].popupTemplate);
			var featureLayerInfo = {
				testLayer: new L.geoJson(null),
				name: inLayerArray[record].name,
				legendIcon: inLayerArray[record].legendIcon,
				url: inLayerArray[record].url,
				bindMarker: bindMarker(markerTemplate),
				createMarker: createMarker(inLayerArray[record]),
				alt: inLayerArray[record].fullName,
				title: inLayerArray[record].markerTitle,
				abbr: inLayerArray[record].abbr,
				riseOnHover: true,
				features: []
			};
			returnInfoArray.push(featureLayerInfo);
			var templateParms = {};
			templateParms[featureLayerInfo.abbr + 'List'] = inLayerArray[record].listTemplate;
			$.templates(templateParms);

		}
		return returnInfoArray;
	};

	featureLayerInfos = buildFeatureLayerInfos(inLayers);

	function testClick(e){
		console.log(e.target.name);
	}

	function buildLayerTitles(){
		var outLayerTitles = {};
		for (var j in featureLayerInfos){
			var layerName = $.render.layerName(featureLayerInfos[j]);
			var layerInfo = $.render.layerInfoDiv(featureLayerInfos[j]);
			outLayerTitles[layerName] = {
				testLayer: featureLayerInfos[j].testLayer,
				layerInfo: {
					abbr:	featureLayerInfos[j].abbr,
					count: 0
				}
			};
		}
		return outLayerTitles;
	}

	function locateMap(){
		map.fitBounds(mapAttributes.mapBounds);
		mapAttributes.locationMarker = L.marker(mapAttributes.mapCenter, {icon: locationIcon});
		map.addLayer(mapAttributes.locationMarker);
		map.addLayer(mapAttributes.mapCircle);
	}
	function reLocateMap(inMapAttributes){
		if (inMapAttributes.validMapCenter && mapAttributes.mapCenter.distanceTo(inMapAttributes.mapCenter)>100){
			mapAttributes.mapCenter = inMapAttributes.mapCenter;
			mapAttributes.mapCircle.setLatLng(mapAttributes.mapCenter);
		}

		if (inMapAttributes.distance !== mapAttributes.distance){
			mapAttributes.distance = inMapAttributes.distance;
			mapAttributes.mapCircle.setRadius(mapAttributes.distance);
		}

		mapAttributes.locationMarker.setLatLng(mapAttributes.mapCenter);
		mapAttributes.mapBounds = mapAttributes.mapCircle.getBounds();
		map.fitBounds(mapAttributes.mapBounds);
		
		updateLayers();
	}

	locateMap();
	
	// Set up Action Layers
	var markers = new L.MarkerClusterGroup({
		spiderfyOnMaxZoom: true,
		disableClusteringAtZoom: 11,
		zoomToBoundsOnClick: true
	}).addTo(map);


	function loadFeatures(featureLayerInfo, markerLayer){
		var queryTask = L.esri.Tasks.query(featureLayerInfo.url)
		.within(mapAttributes.mapBounds);
		queryTask.run(function(error, featureCollection, response){
			var features = featureCollection.features;
			var thisBindPopup = bindMarker(featureLayerInfo.popupTemplate);
			for (var feature in features){
				var coordinates = features[feature].geometry.coordinates;
				var thisFeature = featureLayerInfo.createMarker(features[feature], L.latLng([coordinates[1], coordinates[0]]));
				featureLayerInfo.bindMarker(features[feature],thisFeature);
				featureLayerInfo.features.push({
					distance: metersToMiles(mapAttributes.mapCenter.distanceTo(thisFeature.getLatLng())),
					info: features[feature].properties,
					feature: thisFeature
				});
				console.log(thisFeature);
				markerLayer.addLayers([thisFeature]);
				featureLayerInfo.features[feature].leafletId = thisFeature._leaflet_id;

			}
			featureLayerInfo.features.sort(distanceSort);
			$("#" +featureLayerInfo.abbr + 'List').html($.render.layerListTable(featureLayerInfo));
		});
	}

	function updateLayers(){
		markers._unspiderfy();
		markers.clearLayers();
		for (var j in featureLayerInfos){
			emptyArray(featureLayerInfos[j].features);
			$("#" +featureLayerInfos[j].abbr + 'List').html('');
			if (map.hasLayer(featureLayerInfos[j].testLayer)){
				console.log('update layer ' + featureLayerInfos[j].name);
	//      loadFeatureLayer(featureLayerInfos[j], markers);
				loadFeatures(featureLayerInfos[j], markers);
			}
		}
	}

	function addFeatures(inArray){
		for ( var layerId in inArray){
			$('#'+featureLayerInfos[inArray[layerId]].abbr+'icon').html($.render.layerIcon(featureLayerInfos[inArray[layerId]]));
			map.addLayer(featureLayerInfos[inArray[layerId]].testLayer);
			loadFeatures(featureLayerInfos[inArray[layerId]], markers);
		}
	}
	
	addFeatures(mapAttributes.featureList);

	map.on('overlayadd', function(e){
		for (var j in featureLayerInfos){
			if (e.layer === featureLayerInfos[j].testLayer){
				loadFeatures(featureLayerInfos[j], markers);
			}
		}
	});

	map.on('overlayremove', function(e){
		for (var j in featureLayerInfos){
			if (e.layer === featureLayerInfos[j].testLayer){
				console.log('Removing Layer ' + featureLayerInfos[j].name);
			}
		}
		updateLayers();
	});

	var layerTitles = buildLayerTitles();

	var modifiedLayerControl = L.control.modifiedLayers({}, layerTitles,{
		collapsed: false,
		position: 'divMapInfo'
	});

	modifiedLayerControl.addToDiv(map);

//	layerControl._container.remove();

//	document.getElementById('divMapInfo').appendChild(layerControl.onAdd(map));

//	$('.leaflet-control-layers-overlays label').after($.render())

//	$('#divMapInfo').append(layerControl.onAdd());


// building this to allow for the location of the map to be reset from the new header form
	function setLocation(inMapTemplateParms){
		var mapInfo = validateInput(inMapTemplateParms);
		reLocateMap(mapInfo);
	}

	return {
		map: map,
		markers: markers,
		featureLayerInfos: featureLayerInfos,
		updateLayers: updateLayers,
		mapAttributes: mapAttributes,
		setLocation: setLocation,
//		layerControl: layerControl,
		modifiedLayerControl: modifiedLayerControl,
		currentLeafletId: -1
	};
};

$(document).one('ajaxStop', function(){
	thisMap = citizenMap(layers, QueryString);
});
