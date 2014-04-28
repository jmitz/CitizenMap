// citizenMap.js

citizenMap = {};
citizenMap.div = 'divMap';
citizenMap.baseMapNames = [
	"Topographic",
	"Sattelite"];
citizenMap.maskUrl = "http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer"
citizenMap.map = L.map('divMap').setView([40, -89.5],7);

// Set up Base Mapp
citizenMap.baseLayer = L.esri.basemapLayer(citizenMap.baseMapNames[0]).addTo(citizenMap.map);
citizenMap.maskLayer = L.esri.dynamicMapLayer(citizenMap.maskUrl,{
	opacity:.75,
	layers: [10, 11]
}).addTo(citizenMap.map)



// Set up Feature Layers