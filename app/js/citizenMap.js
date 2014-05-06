// citizenMap.js
L.Icon.Default.imagePath = '/img/leaflet/';
citizenMap = {};
citizenMap.div = 'divMap';

citizenMap.map = L.map('divMap').setView([40, -89.5],7);

citizenMap.baseMap = {
	baseMapLayers: {
		street: [new L.esri.BasemapLayer('Topographic')],
		satellite: [
			new L.esri.BasemapLayer('Imagery'),
			new L.esri.BasemapLayer('ImageryLabels'),
			new L.esri.BasemapLayer('ImageryTransportation')
		]
	},
	current: 'street',
//	layer: L.esri.basemapLayer(citizenMap.baseMap.baseMapLayers.street[0]),
	addBaseMap: function(){
		citizenMap.baseMap.addBaseMapArray(citizenMap.baseMap.baseMapLayers[citizenMap.baseMap.current]);
	},
	addBaseMapArray: function(inArray){
		var index;
		for(index = 0; index < inArray.length; ++index){
			citizenMap.map.addLayer(inArray[index]);
		}
	},
	removeBaseMapArray: function(inArray){
		var index;
		for(index = 0; index < inArray.length; ++index){
			citizenMap.map.removeLayer(inArray[index]);
		}
	},
	switchMap: function(){
		citizenMap.baseMap.removeBaseMapArray(citizenMap.baseMap.baseMapLayers[citizenMap.baseMap.current]);
		citizenMap.baseMap.current = (citizenMap.baseMap.current === 'street')?'satellite':'street';
		citizenMap.baseMap.addBaseMapArray(citizenMap.baseMap.baseMapLayers[citizenMap.baseMap.current]);
	}
};


citizenMap.maskUrl = 'http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer';
citizenMap.featureLayerInfos = [
	{
		name:'Medical Disposal Sites',
		//url: 'http://services1.arcgis.com/qI0WaD4k85ljbKGT/arcgis/rest/services/Medicine_Disposal_Locations/FeatureServer/0',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/0',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h3>Medical "+geojson.properties.Name+"</h3><p>"+geojson.properties.Address+"<br>"+ geojson.properties.City+",  IL</p><p>"+geojson.properties.Telephone+"</p>");
		},
		createMarker: function(geojson, latlng){
			return L.marker(latlng, {icon: L.icon({
				iconUrl: 'img/medicalwastepin.png',
				iconRetinaUrl: 'img/medicalwastepin.png',
				iconSize: [32, 37],
				iconAnchor: [16, 37],
				popupAnchor:[0, -27]
			})});
		}
	},
	{
		name:'Registered eWaste',
		//url: 'http://epa084pgis02.illinois.gov/arcgis/rest/services/OCR/ewastecollectsites_062613/MapServer',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/3',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h3>eWaste "+geojson.properties.Company_Na+"</h3><p>"+geojson.properties.Address+"<br>"+ geojson.properties.City+",  IL</p><p>"+geojson.properties.Phone+"</p>");
		},
		createMarker: function(geojson, latlng){
			return L.marker(latlng, {icon: L.icon({
				iconUrl: 'img/ewasteeventpin.png',
				iconRetinaUrl: 'img/ewasteeventpin.png',
				iconSize: [32, 37],
				iconAnchor: [16, 37],
				popupAnchor:[0, -27]
			})});
		}
	},
	{
		name:'Household Hazardous Waste Collection Sites',
		//url: 'http://epa084pgis02.illinois.gov/arcgis/rest/services/OCR/ewastecollectsites_062613/MapServer',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/1',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h3>Hazardous " + geojson.properties.sponsor + "</h3><p>" + geojson.properties.address + "<br>" + geojson.properties.city + ",  IL</p><p>" + geojson.properties.date + "</p>");
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
			})});
		}
	},
	{
		name:'VIM Testing Stations',
		//url: 'http://geoservices.epa.illinois.gov/arcgis/rest/services/OCR/metroeastvts_edit_092513/FeatureServer/0',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/2',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h3>VIM "+geojson.properties.name+"</h3><p>"+geojson.properties.address+"<br>"+ geojson.properties.city+",  IL</p><p>"+geojson.properties.telephone+"</p><p>"+geojson.properties.operationHours + "</p>");
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
			})});
		}
	}
];



// Set up Base Mapp
citizenMap.baseMap.addBaseMap();
citizenMap.maskLayer = new L.esri.DynamicMapLayer(citizenMap.maskUrl,{
	opacity: 0.75,
	layers: [10, 11]
}).addTo(citizenMap.map);

// Set up Action Layers

citizenMap.markers = new L.MarkerClusterGroup({
	disableClusteringAtZoom: 13
});

citizenMap.addFeatureLayers = function(inArray){
	citizenMap.markers.clearLayers();
	var index;
	for(index = 0; index < inArray.length; ++index){
		citizenMap.loadFeatureLayer(citizenMap.featureLayerInfos[inArray[index]], citizenMap.markers);
	}
};

citizenMap.loadFeatureLayer = function(featureLayerInfo, markerLayer){
	new L.esri.ClusteredFeatureLayer(featureLayerInfo.url,{
		cluster: markerLayer,
		createMarker: featureLayerInfo.createMarker,
		onEachMarker: featureLayerInfo.bindMarker
	}).addTo(citizenMap.map);
};

citizenMap.addFeatureLayers([3, 1, 2, 0]);