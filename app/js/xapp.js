// citizenMap.js

var layers = [
{
	name: 'Medical Waste',
	fullName: 'Medical Waste Disposal Sites',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/0',
	markerIcon: 'img/medicalwastepin.png',
	popupTemplate: "<h5>Medical Disposal<h5><h4><%= properties.Name %></h4><p><%= properties.Address %><br><%= properties.City %>, IL</p><p><%= properties.Telephone %></p>",
	markerTitle: "Name",
	abbr: 'MedWaste'
},{
	name: 'Registered eWaste',
	fullName: 'Registered Electronic Waste Disosal Sites',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/3',
	markerIcon: 'img/ewastepin.png',
	popupTemplate: "<h5>eWaste<h5><h4><%= properties.Company_Na %></h4><p><%= properties.Address %><br><%= properties.City %>, IL</p><p><%= properties.Telephone %></p>",
	markerTitle: "Name",
	abbr: 'EWaste'
},{
	name: 'Household Hazardous Waste',
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
	return {
		validInput: validInput,
		mapCenter: mapCenter,
		mapCircle: mapCircle,
		mapBounds: mapBounds
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
		map.addLayer(urlAttributes.mapCircle);
		//map.addLayer(urlAttributes.mapCenter);
	}

	/* Basemap Layers */
	var baseStreetMap = L.esri.basemapLayer("Topographic");
	var baseSatteliteMap = L.esri.basemapLayer("Imagery");
	var baseSatteliteWithTransportMap = new L.LayerGroup([
		L.esri.basemapLayer("Imagery"),
		L.esri.basemapLayer('ImageryTransportation')
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
				url: inLayerArray[record].url,
				bindMarker: bindMarker(markerTemplate),
				createMarker: createMarker(inLayerArray[record].markerIcon),
				alt: inLayerArray[record].fullName,
				title: inLayerArray[record].markerTitle,
				riseOnHover: true
			};
			returnInfoArray.push(featureLayerInfo);
		}
		return returnInfoArray;
	};


	featureLayerInfos = buildFeatureLayerInfos(inLayers);

	function buildGroupedOverlays(){
		var outGroupedOverlay = {};
		var layerNameTemplate = "<span title='<%=name%>'><%=name%></span>";
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


	function addFeatureLayers (inArray){
		markers.clearLayers();
		var index;
		for(index = 0; index < inArray.length; ++index){
			map.addLayer(featureLayerInfos[inArray[index]].testLayer);
//			loadFeatureLayer(featureLayerInfos[inArray[index]], markers);
}
}

function loadFeatureLayer (featureLayerInfo, markerLayer){
	new L.esri.ClusteredFeatureLayer(featureLayerInfo.url,{
		cluster: markerLayer,
		createMarker: featureLayerInfo.createMarker,
		onEachMarker: featureLayerInfo.bindMarker,
	}).addTo(map);
}

function updateLayers(){
	markers._unspiderfy();
	markers.clearLayers();
	for (var j in featureLayerInfos){
		if (map.hasLayer(featureLayerInfos[j].testLayer)){
			console.log('update layer ' + featureLayerInfos[j].name);
			loadFeatureLayer(featureLayerInfos[j], markers);
		}
	}
}

	//addFeatureLayers([3, 1, 2, 0]);

	map.on('overlayadd', function(e){
		for (var j in featureLayerInfos){
			if (e.layer === featureLayerInfos[j].testLayer){
				loadFeatureLayer(featureLayerInfos[j], markers);
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
		position: 'topleft'
	});

	layerControl.addTo(map);

	return {
		map: map,
		markers: markers,
		featureLayerInfos: featureLayerInfos,
		addFeatureLayers: addFeatureLayers,
		updateLayers: updateLayers
	};
}(layers, QueryString);


