// citizenMap.js

var citizenMap = function(){
	var div = 'divMap';

	var map = L.map('divMap').setView([40, -89.5],7);

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


	var maskUrl = 'http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer';
	var featureLayerInfos = [
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
					iconUrl: 'img/ewastepin.png',
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
				var eventDate = new Date(geojson.properties.date);
				marker.bindPopup("<h3>Hazardous " + geojson.properties.sponsor + "</h3><p>" + geojson.properties.address + "<br>" + geojson.properties.city + ",  IL</p><p>" + eventDate.toDateString() + "</p>");
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



	var maskLayer = new L.esri.DynamicMapLayer(maskUrl,{
		opacity: 0.75,
		layers: [10, 11]
	}).addTo(map);

	// Set up Action Layers

	var markers = new L.MarkerClusterGroup({
		disableClusteringAtZoom: 13
	});

	function addFeatureLayers (inArray){
		markers.clearLayers();
		var index;
		for(index = 0; index < inArray.length; ++index){
			loadFeatureLayer(featureLayerInfos[inArray[index]], markers);
		}
	}

	function loadFeatureLayer (featureLayerInfo, markerLayer){
		new L.esri.ClusteredFeatureLayer(featureLayerInfo.url,{
			cluster: markerLayer,
			createMarker: featureLayerInfo.createMarker,
			onEachMarker: featureLayerInfo.bindMarker
		}).addTo(map);
	}

	// Set up Base Mapp
	baseMap.addBaseMap();

	addFeatureLayers([3, 1, 2, 0]);

	return {
		addFeatureLayers: addFeatureLayers
	};
}();


