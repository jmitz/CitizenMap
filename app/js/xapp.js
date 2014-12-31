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
	"layerName": "<span id='{{: abbr }}icon'><img src='{{: legendIcon }}'></span><span title='{{: name }}'>{{: name }}</span><div class='layerList' id='{{:abbr}}List'></div>",
	"layerIcon": "<img src='{{:legendIcon}}'>",
	"layerListTable": "{{if ~layerCount(features) > 0}}<table class='table table-condensed'>{{for features tmpl=~layerListTmplName(abbr) /}}</table>{{/if}}",
	"testTable": "<tr><td>This</td><td>is a</td><td>table row.</td></tr>"

});

$.views.helpers({
	"layerCount": function(inFeatures){return inFeatures.length;},
	"layerListTmplName": function(inAbbr){return inAbbr + "List";}
});

function parseQuery(inQuery){
	var validInput = true;
	var mapCenter =  L.latLng([40, -89.5]); // Approximate center of Illinois
	var mapCircle = L.circle(mapCenter, 307384); // Circle approximating extent of Illinois
	var mapBounds = mapCircle.getBounds(); // Approximate Bounds of Illinois
	var featureList = []; // List of features to be displayed on map
	if (typeof(inQuery.Lat)==='string' && typeof(inQuery.Lon)==='string'){
		var lat = Math.abs(Number(inQuery.Lat));
		var lon = Math.abs(Number(inQuery.Lon));
		// check to see that the absolute value of longitude (87.4 - 91.6) is greater than the absolute value of latitude (36.9 - 42.5)
		if (lat > lon){
			var tmp = lat;
			lat = lon;
			lon = tmp;
		}
		// set map center to latitude and negative longitude for Illinois
		if (lat > 36.9 && lat < 42.5 && lon > 87.4 && lon < 91.6){
			mapCenter = L.latLng(lat, -lon);
		}
		else {
			validInput = false;
		}
	}
	if (validInput && typeof(inQuery.Miles)==='string'){
		var meters = milesToMeters(inQuery.Miles);
		if (!isNaN(meters)){
			mapCircle = L.circle(
				mapCenter, 
				meters,{
					fill: false
				});
			mapBounds = mapCircle.getBounds();
		}
		else{
			validInput = false;
		}
	}

	for (var layer in layers){
		if(inQuery[layers[layer].abbr]==='true'){
			featureList.push(layer);
		}
	}

	return {
		validInput: validInput,
		mapCenter: mapCenter,
		mapCircle: mapCircle,
		mapBounds: mapBounds,
		featureList: featureList
	};
}

var citizenMap = function(inLayers, inQuery){
	var urlAttributes = parseQuery(inQuery);
	var div = 'divMap';

	var map = L.map('divMap',{
		maxZoom: 17,
		minZoom: 6,
		center: L.latLng([40, -89.5]),
		zoom: 7,
		zoomControl: true
	});

	if (urlAttributes.validInput){
		map.fitBounds(urlAttributes.mapBounds);
		map.addLayer(urlAttributes.mapCircle);
	}

	var locationIcon = L.icon({
		iconUrl: 'img/location.png',
		iconRetinaUrl: 'img/location.png',
		iconSize: [30, 30],
		iconAnchor: [15,15]
	});

	var locationMarker = L.marker(urlAttributes.mapCenter, {icon: locationIcon});

	map.addLayer(locationMarker);

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
		var fromLocation = locationMarker.getLatLng();
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

	function buildLayerTitles(){
		var outLayerTitles = {};
		for (var j in featureLayerInfos){
			var layerName = $.render.layerName(featureLayerInfos[j]);
			outLayerTitles[layerName] = featureLayerInfos[j].testLayer;
		}
		return outLayerTitles;
	}

	// Set up Action Layers

	var markers = new L.MarkerClusterGroup({
		spiderfyOnMaxZoom: true,
		disableClusteringAtZoom: 11,
		zoomToBoundsOnClick: true
	}).addTo(map);


	function loadFeatures(featureLayerInfo, markerLayer){
		var queryTask = L.esri.Tasks.query(featureLayerInfo.url)
		.within(urlAttributes.mapBounds);
		queryTask.run(function(error, featureCollection, response){
			var features = featureCollection.features;
			var thisBindPopup = bindMarker(featureLayerInfo.popupTemplate);
			for (var feature in features){
				var coordinates = features[feature].geometry.coordinates;
				var thisFeature = featureLayerInfo.createMarker(features[feature], L.latLng([coordinates[1], coordinates[0]]));
				featureLayerInfo.bindMarker(features[feature],thisFeature);
				featureLayerInfo.features.push({
					distance: metersToMiles(urlAttributes.mapCenter.distanceTo(thisFeature.getLatLng())),
					info: features[feature].properties,
					feature: thisFeature
				});
				markerLayer.addLayers([thisFeature]);
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
	
	addFeatures(urlAttributes.featureList);

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

	var layerControl = L.control.layers(baseLayers, buildLayerTitles(),{
		collapsed: false,
		position: 'topright'
	});

	layerControl.addTo(map);

	return {
		map: map,
		locationMarker: locationMarker,
		markers: markers,
		featureLayerInfos: featureLayerInfos,
		updateLayers: updateLayers,
		urlAttributes: urlAttributes
	};
};

$(document).one('ajaxStop', function(){
	thisMap = citizenMap(layers, QueryString);
});
