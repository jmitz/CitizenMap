// start.js
/*
 *  JavaScript used to get Query String from URL
 *  Posted http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
 */
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ();

legendGroup = $(function($){
  var group = $('#legend');

  function getActive(){
    var activeArray = [];
    $('button', group).each(function(){
      if ($(this).hasClass('active')){
        activeArray.push(parseInt($(this).val(),10));
      }
    });
    return activeArray;
  }
  $('button', group).each(function(){
    $(this).on("click", function(){
        $(this).toggleClass('active');
        citizenMap.addFeatureLayers(getActive());
    });
  });
});

L.Icon.Default.imagePath = '/img/leaflet/';

/* ---------------------------------------------------------------------- */
/*  Services Locator Form
/* ---------------------------------------------------------------------- */
//

/*  Services Locator Functions */

var suggestionUrlTemplate = $.templates("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text={{:inText}}&location={{:encLngLat}}&distance={{:distance}}&f=json");
var findUrlTemplate = $.templates("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text={{:location}}&magicKey={{:magicKey}}&f=json");
var mapUrlTemplate = $.templates("index.html?Lat={{:lat}}&Lon={{:lng}}&Miles={{:distance}}&{{:dataTypeString}}");
var reIllinois = /, Illinois, (USA|United States)/;

var selectedLocation;

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
  var inLocation = jQuery('input[name=inLocation').val();
  var templateParms = {
    distance: 10,
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
      if (newMap){
        window.location = mapUrlTemplate.render(templateParms);
      }
      else{
        thisMap.setLocation(templateParms);
      }
    }
  });
}

jQuery(document).ready(function(){
  if(jQuery('form#service-locator').length) {
    jQuery('form#service-locator').submit(function(e){
      buildMapUrl(true);
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }
});

jQuery(document).ready(function(){
  if(jQuery('form#refine-services').length) {
    jQuery('form#refine-services').submit(function(e){
      buildMapUrl();
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }
});
