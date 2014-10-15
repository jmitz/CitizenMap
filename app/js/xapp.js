// citizenMap.js

var layers = [
{
	name: 'Medical Disposal Sites',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/0',
	markerIcon: 'img/medicalwastepin.png',
	popupTemplate: "<h5>Medical Disposal<h5><h4><%= properties.Name %></h4><p><%= properties.Address %><br><%= properties.City %>, IL</p><p><%= properties.Telephone %></p>",
	markerTitle: "Name"
},{
	name: 'Registered eWaste',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/3',
	markerIcon: 'img/ewastepin.png',
	popupTemplate: "<h5>eWaste<h5><h4><%= properties.Company_Na %></h4><p><%= properties.Address %><br><%= properties.City %>, IL</p><p><%= properties.Telephone %></p>",
	markerTitle: "Name"
},{
	name: 'Household Hazardous Waste Collection Sites',
	url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/1',
	markerIcon: {
		variable: 'type',
		icons:{
			"0": 'img/householdhazardpin.png',
			"1": 'img/householdhazardeventpin.png'
		}
	},
	popupTemplate: "<h5>Household Hazardous Waste Disposal<h5><h4><%= properties.Company_Na %></h4><p><%= properties.Address %><br><%= properties.City %>, IL</p><p><%= properties.Telephone %></p>",
	markerTitle: "Name"
}];


var citizenMap = function(){
	var div = 'divMap';

	var map = L.map('divMap',{
		maxZoom: 17,
		minZoom: 6,
		center: L.latLng([40, -89.5]),
		zoom: 7
	});

	var baseMap = {
		baseMapLayers: {
			street: [new L.esri.BasemapLayer('Topographic')],
			satellite: [
			new L.esri.BasemapLayer('Imagery'),
			new L.esri.BasemapLayer('ImageryLabels'),
			new L.esri.BasemapLayer('ImageryTransportation')
			]
		},
		current: 'street',
		//	layer: L.esri.basemapLayer(baseMap.baseMapLayers.street[0]),
		addBaseMap: function(){
			baseMap.addBaseMapArray(baseMap.baseMapLayers[baseMap.current]);
		},
		addBaseMapArray: function(inArray){
			var index;
			for(index = 0; index < inArray.length; ++index){
				map.addLayer(inArray[index]);
			}
		},
		removeBaseMapArray: function(inArray){
			var index;
			for(index = 0; index < inArray.length; ++index){
				map.removeLayer(inArray[index]);
			}
		},
		switchMap: function(){
			baseMap.removeBaseMapArray(baseMap.baseMapLayers[baseMap.current]);
			baseMap.current = (baseMap.current === 'street')?'satellite':'street';
			baseMap.addBaseMapArray(baseMap.baseMapLayers[baseMap.current]);
		}
	};

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

var maskUrl = 'http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer';
var featureLayerInfos = [{
	testLayer: new L.geoJson(null),
	name:'Medical Disposal Sites',
		//url: 'http://services1.arcgis.com/qI0WaD4k85ljbKGT/arcgis/rest/services/Medicine_Disposal_Locations/FeatureServer/0',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/0',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h5>Medical Waste</h5><h4>"+geojson.properties.Name+"</h4><p>"+geojson.properties.Address+"<br>"+ geojson.properties.City+",  IL</p><p>"+geojson.properties.Telephone+"</p>");
		},
		createMarker: function(geojson, latlng){
			return L.marker(latlng, {icon: L.icon({
				iconUrl: 'img/medicalwastepin.png',
				iconRetinaUrl: 'img/medicalwastepin.png',
				iconSize: [32, 37],
				iconAnchor: [16, 37],
				popupAnchor:[0, -27]
			}),
			alt: 'Medical Disposal Site',
			title: geojson.properties['Name'],
			riseOnHover: true
		});
		},
		markerTitle: 'Name'
	},
	{
		testLayer: new L.geoJson(null),
		name:'Registered eWaste',
		//url: 'http://epa084pgis02.illinois.gov/arcgis/rest/services/OCR/ewastecollectsites_062613/MapServer',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/3',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h5>eWaste</h5><h4>"+geojson.properties.Company_Na+"</h4><p>"+geojson.properties.Address+"<br>"+ geojson.properties.City+",  IL</p><p>"+geojson.properties.Phone+"</p>");
		},
		createMarker: function(geojson, latlng){
			return L.marker(latlng, {icon: L.icon({
				iconUrl: 'img/ewastepin.png',
				iconRetinaUrl: 'img/ewasteeventpin.png',
				iconSize: [32, 37],
				iconAnchor: [16, 37],
				popupAnchor:[0, -27]
			}),
			alt: 'Electronic Waste Collection',
			title: geojson.properties['Company_Na'],
			riseOnHover: true
		});
		}
	},
	{
		testLayer: new L.geoJson(null),
		name:'Household Hazardous Waste Collection Sites',
		//url: 'http://epa084pgis02.illinois.gov/arcgis/rest/services/OCR/ewastecollectsites_062613/MapServer',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/1',
		bindMarker: function(geojson, marker){
			var eventDate = new Date(geojson.properties.date);
			marker.bindPopup("<h5>Household Hazardous Waste Disposal</h5><h4>" + geojson.properties.sponsor + "</h4><p>" + geojson.properties.address + "<br>" + geojson.properties.city + ",  IL</p><p>" + eventDate.toDateString() + "</p>");
		},
		createMarker: function(geojson, latlng){
			iconUrls = [
			'img/householdhazardpin.png',
			'img/householdhazardeventpin.png'
			];
			return L.marker(latlng, {icon: L.icon({
				iconUrl: iconUrls[geojson.properties.type],
				iconRetinaUrl: iconUrls[geojson.properties.type],
				iconSize: [32, 37],
				iconAnchor: [16, 37],
				popupAnchor:[0, -27]
			}),
			alt: 'Household Hazardous Waste Collection',
			title: geojson.properties['sponsor'],
			riseOnHover: true
		});
		}
	},
	{
		testLayer: new L.geoJson(null),
		name:'Vehicle Emmission Testing',
		//url: 'http://geoservices.epa.illinois.gov/arcgis/rest/services/OCR/metroeastvts_edit_092513/FeatureServer/0',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/2',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h5>Vehicle Testing Station</h5><h4>"+geojson.properties.name+"</h4><p>"+geojson.properties.address+"<br>"+ geojson.properties.city+",  IL</p><p>"+geojson.properties.telephone+"</p><p>"+geojson.properties.operationHours + "</p>");
		},
		createMarker: function(geojson, latlng){
			iconUrls = [
			'img/bluevehiclepin.png',
			'img/greenvehiclepin.png',
			'img/yellowvehiclepin.png'
			];
			return L.marker(latlng, {icon: L.icon({
				iconUrl: iconUrls[geojson.properties.type - 1],
				iconRetinaUrl: iconUrls[geojson.properties.type - 1],
				iconSize: [32, 37],
				iconAnchor: [16, 37],
				popupAnchor:[0, -27]
			}),
			alt: 'Vehicle Emmission Testing Station',
			title: geojson.properties['name'],
			riseOnHover: true
		});
		}
	}];

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


	// Set up Base Mapp
	baseMap.addBaseMap();

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
}();


