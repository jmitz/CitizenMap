// citizenMap.js
L.Icon.Default.imagePath = '/img/leaflet/';
citizenMap = {};
citizenMap.div = 'divMap';
citizenMap.baseMapNames = [
	'Topographic',
	'Sattelite'];
citizenMap.maskUrl = 'http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer'
citizenMap.actionLayers = [
	{
		name:'Medical Disposal Sites',
		//url: 'http://services1.arcgis.com/qI0WaD4k85ljbKGT/arcgis/rest/services/Medicine_Disposal_Locations/FeatureServer/0',
		url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/CitizenPrograms/FeatureServer/0',
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h3>Mecical "+geojson.properties.Name+"</h3><p>"+geojson.properties.Address+"<br>"+ geojson.properties.City+",  IL</p><p>"+geojson.properties.Telephone+"</p>");
		},
		createMarker: function(geojson, latlng){
			return L.marker(latlng, {icon: L.icon({
				iconUrl: 'img/medicalwastepin.png',
				iconRetinaUrl: 'img/medicalwastepin.png',
				iconSize: [32, 37],
				iconAncor: [16, 37],
				popupAncor:[0, -11]
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
				iconAncor: [16, 37],
				popupAncor:[0, -11]
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
			return L.marker(latlng, {icon: L.icon({
				iconUrl: 'img/householdhazardpin.png',
				iconRetinaUrl: 'img/householdhazardpin.png',
				iconSize: [32, 37],
				iconAncor: [16, 37],
				popupAncor:[0, -11]
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
			return L.marker(latlng, {icon: L.icon({
				iconUrl: 'img/bluevehiclepin.png',
				iconRetinaUrl: 'img/bluevehiclepin.png',
				iconSize: [32, 37],
				iconAncor: [16, 37],
				popupAncor:[0, -11]
			})});
		}
	}
];


citizenMap.map = L.map('divMap').setView([40, -89.5],7);


// Set up Base Mapp
citizenMap.baseLayer = new L.esri.BasemapLayer(citizenMap.baseMapNames[0]).addTo(citizenMap.map);
citizenMap.maskLayer = new L.esri.DynamicMapLayer(citizenMap.maskUrl,{
	opacity:.75,
	layers: [10, 11]
}).addTo(citizenMap.map);

// Set up Action Layers

citizenMap.featureLayers = [
	new L.esri.ClusteredFeatureLayer(citizenMap.actionLayers[0].url,{
		cluster: new L.MarkerClusterGroup(),
		createMarker: citizenMap.actionLayers[0].createMarker,
		onEachMarker: citizenMap.actionLayers[0].bindMarker
	}).addTo(citizenMap.map),
	new L.esri.ClusteredFeatureLayer(citizenMap.actionLayers[1].url,{
		cluster: new L.MarkerClusterGroup(),
		createMarker: citizenMap.actionLayers[1].createMarker,
		onEachMarker: citizenMap.actionLayers[1].bindMarker
	}).addTo(citizenMap.map),
	new L.esri.ClusteredFeatureLayer(citizenMap.actionLayers[2].url,{
		cluster: new L.MarkerClusterGroup(),
		createMarker: citizenMap.actionLayers[2].createMarker,
		onEachMarker: citizenMap.actionLayers[2].bindMarker
	}).addTo(citizenMap.map),
	new L.esri.ClusteredFeatureLayer(citizenMap.actionLayers[3].url,{
		cluster: new L.MarkerClusterGroup(),
		createMarker: citizenMap.actionLayers[3].createMarker,
		onEachMarker: citizenMap.actionLayers[3].bindMarker
	}).addTo(citizenMap.map)
	];

