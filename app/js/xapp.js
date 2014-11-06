// citizenMap.js

var layers = [
{
	name: 'Medical Waste',
	legendIcon: 'img/medicalwaste.png',
	fullName: 'Medical Waste Disposal Sites',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/0',
	markerIcon: 'img/medicalwastepin.png',
	popupTemplate: "<h5>Medical Disposal<h5><h4><%= properties.Name %></h4><p><%= properties.Address %><br><%= properties.City %>, IL</p><p><%= properties.Telephone %></p>",
	markerTitle: "Name",
	abbr: 'MedWaste'
},{
	name: 'Registered eWaste',
	legendIcon: 'img/ewaste.png',
	fullName: 'Registered Electronic Waste Disosal Sites',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/3',
	markerIcon: 'img/ewastepin.png',
	popupTemplate: "<h5>eWaste<h5><h4><%= properties.Company_Na %></h4><p><%= properties.Address %><br><%= properties.City %>, IL</p><p><%= properties.Telephone %></p>",
	markerTitle: "Name",
	abbr: 'EWaste'
},{
	name: 'Household Hazardous Waste',
	legendIcon: 'img/household.png',
	fullname: 'Household Hazardous Waste Collection Sites',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/1',
	markerIcon: {
		variable: 'type',
		icons:{
			"0": 'img/householdhazardpin.png',
			"1": 'img/householdhazardeventpin.png'
		}
	},
	popupTemplate: "<h5>Household Hazardous Waste Disposal<h5><h4><%= properties.sponsor %></h4><p><%= properties.address %><br><%= properties.city %>, IL</p><p><% if (properties.type === 1){var inDate = new Date(properties.date); print(inDate.toDateString());} %></p>",
	markerTitle: "Name",
	abbr: 'HouseHaz'
},{
	name: 'Vehicle Testing',
	legendIcon: 'img/vehicle.png',
	fullName: 'Vehicle Emission Inspection and Testing',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/2',
	markerIcon: {
		variable: 'type',
		icons:{
			"1": 'img/bluevehiclepin.png',
			"2": 'img/greenvehiclepin.png',
			"3": 'img/yellowvehiclepin.png'
		}
	},
	popupTemplate: "<h5>Vehicle Testing Station<h5><h4><%= properties.name %></h4><p><%= properties.address %><br><%= properties.city %>, IL</p><p><%= properties.telephone %></p><p><%= properties.operationHours %></p>",
	markerTitle: "name",
	abbr: 'VIM'
}];

function milesToMeters(inMiles){
	return (inMiles * 1609.34);
}

function metersToMiles(inMeters){
	return Math.round(inMeters * 0.000621373);
}

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
			mapCircle = L.circle(mapCenter, meters);
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
		zoom: 7
	});

	if (urlAttributes.validInput){
		map.fitBounds(urlAttributes.mapBounds);
//		map.addLayer(urlAttributes.mapCircle);
		//map.addLayer(urlAttributes.mapCenter);
	}

	var locationIcon = L.icon({
		iconUrl: 'img/location.png',
		iconRetinaUrl: 'img/location.png',
		iconSize: [30, 30],
		iconAnchor: [0,0]
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

	var maskUrl = 'http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer';

	var bindMarker = function(inTemplate){
		return function(geojson, marker){
			marker.bindPopup(inTemplate(geojson));
		};
	};

	var createMarker = function(inMarkerIcon){
		if (typeof(inMarkerIcon)==='string'){
			returnCreateMarker = function(geojson, latLng){
				return L.marker(latLng, {icon: L.icon({
					iconUrl: inMarkerIcon,
					iconRetinaUrl: inMarkerIcon,
					iconSize: [32, 37],
					iconAnchor: [16, 37],
					popupAnchor:[0, -27]
				})});		
			};
		}
		else {
			returnCreateMarker = function(geojson, latLng){
				iconUrls = inMarkerIcon.icons;
				return L.marker(latLng, {icon: L.icon({
					iconUrl: iconUrls[geojson.properties[inMarkerIcon.variable]],
					iconRetinaUrl: iconUrls[geojson.properties[inMarkerIcon.variable]],
					iconSize: [32, 37],
					iconAnchor: [16, 37],
					popupAnchor:[0, -27]
				})});
			};
		}

		return returnCreateMarker;
	};

	var buildFeatureLayerInfos = function(inLayerArray){
		var returnInfoArray = [];
		for (var record in inLayerArray){
			var markerTemplate =  _.template(inLayerArray[record].popupTemplate);
			var featureLayerInfo = {
				testLayer: new L.geoJson(null),
				name: inLayerArray[record].name,
				legendIcon: inLayerArray[record].legendIcon,
				url: inLayerArray[record].url,
				bindMarker: bindMarker(markerTemplate),
				createMarker: createMarker(inLayerArray[record].markerIcon),
				alt: inLayerArray[record].fullName,
				title: inLayerArray[record].markerTitle,
				abbr: inLayerArray[record].abbr,
				riseOnHover: true
			};
			returnInfoArray.push(featureLayerInfo);
		}
		return returnInfoArray;
	};


	featureLayerInfos = buildFeatureLayerInfos(inLayers);

	function buildGroupedOverlays(){
		var outGroupedOverlay = {};
		var layerNameTemplate = "<span id='<%= abbr %>icon'><img src='<%= legendIcon %>'></span><span title='<%= name %>'><%= name %></span>";
		outGroupedOverlay.Working = {};
		for (var j in featureLayerInfos){
			var layerName = _.template(layerNameTemplate,featureLayerInfos[j]);
			outGroupedOverlay.Working[layerName] = featureLayerInfos[j].testLayer;
		}
		return outGroupedOverlay;
	}

	var maskLayer = new L.esri.DynamicMapLayer(maskUrl,{
		opacity: 0.75,
		layers: [10]
	});

	// Set up Action Layers

	var markers = new L.MarkerClusterGroup({
		spiderfyOnMaxZoom: true,
		disableClusteringAtZoom: 13,
		zoomToBoundsOnClick: true
	}).addTo(map);


	function loadFeatures(featureLayerInfo, markerLayer){
		var queryTask = L.esri.Tasks.query(featureLayerInfo.url)
		.within(urlAttributes.mapBounds);
		console.log(urlAttributes.mapBounds);
		queryTask.run(function(error, featureCollection, response){
			var features = featureCollection.features;
			var thisBindPopup = bindMarker(featureLayerInfo.popupTemplate);
			for (var feature in features){
				var coordinates = features[feature].geometry.coordinates;
				var thisFeature = featureLayerInfo.createMarker(features[feature], L.latLng([coordinates[1], coordinates[0]]));
				featureLayerInfo.bindMarker(features[feature],thisFeature);
				markerLayer.addLayers([thisFeature]);
			}
		});
	}

	function updateLayers(){
		markers._unspiderfy();
		markers.clearLayers();
		for (var j in featureLayerInfos){
			if (map.hasLayer(featureLayerInfos[j].testLayer)){
				console.log('update layer ' + featureLayerInfos[j].name);
	//			loadFeatureLayer(featureLayerInfos[j], markers);
				loadFeatures(featureLayerInfos[j], markers);
			}
		}
	}

	function addFeatures(inArray){
		for ( var layerId in inArray){
			$('#'+featureLayerInfos[inArray[layerId]].abbr+'icon').html("<img src='"+featureLayerInfos[inArray[layerId]].legendIcon+"'>");
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


	var layerControl = L.control.groupedLayers(baseLayers,buildGroupedOverlays(),{
		collapsed: false,
		closeButton: true,
		position: 'topright',
		placeholder: 'Address or Place Name'
	});

	
	var searchControl = new L.esri.Controls.Geosearch({
		useMapBounds: true,
		position: 'topleft',
		zoomToResult: false,
		collapseAfterResult: true,
		expanded: false
	}).addTo(map);

	var results = new L.LayerGroup().addTo(map);

	layerControl.addTo(map);

	searchControl.on('results', function(data){
		console.log(data);
		urlAttributes.mapCenter = data.latlng;
		urlAttributes.mapCircle.setLatLng(data.latlng);
		urlAttributes.mapBounds = urlAttributes.mapCircle.getBounds();
		locationMarker.setLatLng(urlAttributes.mapCenter);
		map.fitBounds(urlAttributes.mapBounds);
    results.clearLayers();
    updateLayers();
  });
	return {
		map: map,
		markers: markers,
		featureLayerInfos: featureLayerInfos,
		updateLayers: updateLayers,
		urlAttributes: urlAttributes
	};
}(layers, QueryString);


