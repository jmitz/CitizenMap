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

if (QueryString.Name){
  jQuery('input[name=inLocation]').val(decodeURIComponent(QueryString.Name));
  selectedLocation.location = decodeURIComponent(QueryString.Name);
}

if (QueryString.Miles){
  jQuery('select[name=distance]').val(QueryString.Miles);
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


// $('.feature-row').on('click', function(e){
//   console.log(e);
// });

// $(document).on('mouseover', '.feature-row', function(e) {
//   if (thisMap.currentLeafletId !== e.currentTarget.id){
//     thisMap.currentLeafletId = e.currentTarget.id;
//     console.log(thisMap.currentLeafletId);
//   }
// });

// $(document).on('mouseout', '.feature-row', function(e){
//   if (thisMap.currentLeafletId !== e.currentTarget.id){
//     thisMap.currentLeafletId = -1;
//     console.log(thisMap.currentLeafletId);
//   }
// });