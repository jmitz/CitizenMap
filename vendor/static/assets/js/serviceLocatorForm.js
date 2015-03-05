/* ---------------------------------------------------------------------- */
/*  Services Locator Form
/* ---------------------------------------------------------------------- */
//

/*  Services Locator Functions */

var reIllinois = /, Illinois, (USA|United States)/;
var suggestionUrlTemplate = $.templates("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text={{:inText}}&location={{:encLngLat}}&distance={{:distance}}&f=json");
var findUrlTemplate = $.templates("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text={{:location}}&magicKey={{:magicKey}}&f=json");
var mapUrlTemplate = $.templates("index.html?Lat={{:lat}}&Lon={{:lng}}&Miles={{:miles}}&Name={{:name}}&{{:dataTypeString}}");

var selectedLocation = {};

function filterSuggestions(inArray) {
  var returnArray = [];
  for (var item in inArray){
    if (reIllinois.test(inArray[item].text)){
      returnArray.push({location: inArray[item].text, magicKey: inArray[item].magicKey});
    }
  }
  selectedLocation = returnArray[0];
  return returnArray;
}

function getSuggestions(inText, callBack){
  if (inText.length<3) {
    return;
  }
  var parms = {
    inText: encodeURIComponent(inText),
    encLngLat: encodeURIComponent('-89.5,39.8'),
    distance: 320000
  };
  var url = suggestionUrlTemplate.render(parms);
  jQuery.ajax(url, {
    dataType: 'json',
    success: function(inJson){
      var suggestions = filterSuggestions(inJson.suggestions);
      callBack(suggestions);
    }
  });
}

var typeahead = jQuery('.typeahead').typeahead({
  minLength: 3,
  highlight: true,
  hint: true
//  autoselect: true
},{
  name: 'location',
  displayKey: 'location',
  source: getSuggestions
}).
bind('typeahead:selected', function(obj, datum, name){
  selectedLocation = datum;
});

function buildMapUrl(newMap){
  var dataTypes = [];
  jQuery('input[name=dataType]:checked').each(function(index){
    dataTypes.push(this.value);
  });
  var inLocation = jQuery('input[name=inLocation]').val();
  var inDistance = jQuery(newMap?'input[name=distance]':'select[name=distance] option:selected').val();
  var templateParms = {
    miles: inDistance,
    dataTypeString: dataTypes.join('=true&')+'=true'
  };
  var locationParms = {
    location: encodeURIComponent(selectedLocation.location),
    magicKey: selectedLocation.magicKey
  };
  var findUrl = findUrlTemplate.render(locationParms);
  jQuery.ajax(findUrl,{
    dataType: 'json',
    success: function(inJson){
      templateParms.lat = inJson.locations[0].feature.geometry.y;
      templateParms.lng = inJson.locations[0].feature.geometry.x;
      templateParms.name = encodeURIComponent(inJson.locations[0].name);
      if (newMap){
        window.location = mapUrlTemplate.render(templateParms);
      }
      else{
        jQuery('input[name=inLocation]').val(selectedLocation.location);
        thisMap.setLocation(templateParms);
      }
    }
  });
}

$(window).resize(function(){
  var availableHeight = $(window).height();
  var currentWidth = $(window).width();
  var pageTopHeight = $('#header').height();
  $('.mapHolder').height(availableHeight-pageTopHeight);
});

$(window).resize();

$(document).on('typeahead:selected', function(e){
  form = $(e.target).closest('form');
//  console.log(form);
});
