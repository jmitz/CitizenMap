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
		url: 'http://services1.arcgis.com/qI0WaD4k85ljbKGT/arcgis/rest/services/Medicine_Disposal_Locations/FeatureServer/0',
		fields: [
			'Name',
			'Address',
			'City',
			'Telephone'
		],
		bindMarker: function(geojson, marker){
			marker.bindPopup("<h3>"+geojson.properties.Name+"</h3><p>"+geojson.properties.Address+"<br>"+ geojson.properties.City+",  IL</p><p>"+geojson.properties.Telephone+"</p>");
		}
	},
	{
		name:'Registered eWaste',
		url: 'http://epa084pgis02.illinois.gov/arcgis/rest/services/OCR/ewastecollectsites_062613/MapServer',
		layers: [0]
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
		onEachMarker: citizenMap.actionLayers[0].bindMarker
	}).addTo(citizenMap.map),
	new L.esri.DynamicMapLayer(citizenMap.actionLayers[1].url,{
		layers: citizenMap.actionLayers[1].layers
	}).addTo(citizenMap.map)
	];

