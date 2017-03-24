dojo.ready(function () { 
  var countryArray = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "Channel Islands", "Chile", "China", "China Hong Kong", "China Macao", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czech Republic", "Democratic Peoples Republic Korea", "Democratic Republic Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Faeroe Islands", "Falkland Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of Korea", "Republic of Moldova", "Romania", "Russian Federation", "Rwanda", "Réunion", "Saint Helena", "Saint Kitts Nevis", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "State of Palestine", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Tajikistan", "Thailand", "The former Yugoslav Republic Macedonia", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United Republic Tanzania", "United States Virgin Islands", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Wallis Futuna Islands", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"];

  $.each(countryArray, function(val, text) {$('#dropDownCountry').append( $('<option></option>').val(text).html(text));});
  $('select option:contains("Austria")').prop('selected',true);
  $('.selectpicker').selectpicker({container: 'body'});
  // keep dropdown menu open until a second click is performed
  $('div.dropdown-menu').on('click', function(event) {event.stopPropagation();}); 
  
  $('body').on('click', function(event) {
    var target = $(event.target);
    if (target.parents('.bootstrap-select').length) {
      event.stopPropagation();
      //$('.bootstrap-select.open').removeClass('open');
    }
  }); 
  
  $("#about").click(function(e){
    $("#aboutModal").modal("show"); 
    $("body").css("margin-right","0px");
    $(".navbar").css("margin-right","0px");          
  });
});

      // create a legend 
var map, featureLayer, dialog, featureJSON, identifyTask, identifyParams, myOnClick_connect, graphicId = '',
tags, last_tags, animationTool, year = 1980, newPop, newInOut;


require(["esri/map", "application/bootstrapmap", "esri/layers/FeatureLayer", "esri/dijit/Legend", "esri/graphic", 
  "esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/renderers/ClassBreaksRenderer", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
  "esri/layers/ArcGISTiledMapServiceLayer", "esri/geometry/Point", "esri/TimeExtent", "esri/dijit/TimeSlider","dojo/on", "dojo/domReady!"], 
  function(Map, BootstrapMap, FeatureLayer, Legend, Graphic, SimpleLineSymbol, SimpleFillSymbol, ClassBreaksRenderer, 
    IdentifyTask, IdentifyParameters, ArcGISTiledMapServiceLayer, Point, TimeExtent, TimeSlider, on) {   
    
    map = BootstrapMap.create("mapDiv",{center: [20, 30],zoom: 3});
    var migrationlayer = "http://cga-app01.cadm.harvard.edu/arcgis/rest/services/crossroadofmigration/migration/MapServer/2"
    var basemap_url = "http://cga-app01.cadm.harvard.edu/arcgis/rest/services/crossroadofmigration/basemapocean/MapServer"

    var basemap = new ArcGISTiledMapServiceLayer(basemap_url);
    
    dojo.connect(map, "onLoad", initOperationalLayersFirst);
    //dojo.connect(map, "onLoad", mapReady);      
    dojo.connect(map, 'onZoomEnd', function() {
      maxOffset = calcOffset();
      featureLayer.setMaxAllowableOffset(maxOffset);
    });
    map.addLayer(basemap);

    function calcOffset() {
      return (map.extent.getWidth() / map.width);
    }

    function worldrenderer(){
      var symbol = new SimpleFillSymbol();
      var renderer = new ClassBreaksRenderer(symbol, "Count");
      renderer.addBreak({minValue: 1, maxValue: 500, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), label: "1 - 500"});
      renderer.addBreak({minValue: 501, maxValue: 1001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), label: "1 - 1,000"});
      renderer.addBreak({minValue: 1001, maxValue: 10001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,0]), 2), label: "1,001 - 10,000"});
      renderer.addBreak({minValue: 10001, maxValue: 100001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,128,0]), 2), label: "10,001 - 100,000"});
      renderer.addBreak({minValue: 100001, maxValue: 1000001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), label: "100,001 - 1,000,000"});
      renderer.addBreak({minValue: 1000001, maxValue: 51000000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,255]), 2), label: "1,000,000 +"}); 
      return renderer;
    }

            

    function initOperationalLayersFirst() {   
      featureLayer = new FeatureLayer(migrationlayer, {
        mode: FeatureLayer.MODE_SNAPSHOT,        
        maxAllowableOffset: calcOffset(),
        outFields: ["*"],
        supportsAdvancedQueries: true
      });     
    
      featureLayer.setRenderer(worldrenderer());      
      featureLayer.setDefinitionExpression("Origin = 'Austria'");
      featureLayer.setOpacity(.90);
      var timeExtent = new esri.TimeExtent();
      timeExtent.startTime = new Date("01/01/2013 UTC");
      timeExtent.endTime = new Date("12/31/2013 UTC");      
      featureLayer.setTimeDefinition(timeExtent);

      map.addLayer(featureLayer);        
      // start dialog        
      var highlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255]), 5);

      //close the dialog when the mouse leaves the highlight graphic
      map.on("load", function(){
        map.graphics.enableMouseEvents();
        map.graphics.on("mouse-out", closeDialog);          
      });
                
      //listen for when the onMouseOver event fires on the countiesGraphicsLayer
      //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer
      //featureLayer.on("mouse-over", function(evt){
      featureLayer.on("mouse-over", function(evt){      
        var dataAttr = new Date(  evt.graphic.attributes.year )
        dataAttr.setMonth(dataAttr.getMonth() + 1);        
        
        map.graphics.clear();       
        var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);      
        //console.log("step1", highlightGraphic)
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
           $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }
        bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(5) + " % of All Immigrants to " + evt.graphic.attributes.Dest  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(5) + " % of Total Population in " + evt.graphic.attributes.Dest + "</li><ul>");
        
        map.graphics.add(highlightGraphic); 
      });
      
      //graphicId = map.graphicsLayerIds;

      // create a legend 
      var legendDijit = new Legend({
          map: map,
          layerInfos: [{
            "defaultSymbol": false,
            "layer": featureLayer,
            "title": " "
              }]
            }, "legendDiv");
      legendDijit.startup();              
      mapReady(map);
    }   

    // look for the origin/destination radio button change 
    $("input[name='migrationtype']").on("change",function(){
      if(year == 1980){year = 2013}
      $(".alert").remove();      
      map.graphics.clear();
      closeDialog();
      map.removeLayer(featureLayer);
      
      featureLayer = new FeatureLayer(migrationlayer, {
        mode: FeatureLayer.MODE_SNAPSHOT,
        maxAllowableOffset: calcOffset(),
        outFields: ["*"]
      });

      var timeExtent = new esri.TimeExtent();
      timeExtent.startTime = new Date("01/01/" + year + "UTC");
      timeExtent.endTime = new Date("12/31/" + year + "UTC");      
      featureLayer.setTimeDefinition(timeExtent);
      featureLayer.setRenderer(worldrenderer());
      //console.log($('select option:selected').text());
      if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("Origin = '" + $('select option:selected').text() + "'");}
      else {featureLayer.setDefinitionExpression("Dest = '" + $('select option:selected').text() + "'");}
      
      $('.selectpicker').selectpicker('refresh');
      $('select').attr('disabled','disabled');
      map.addLayer(featureLayer);   
      //graphicId = map.graphicsLayerIds;
      //console.log(graphicId)
      // center the layer extent       
      featureLayer.on("update-end", function(){
        var centerLayer = featureLayer.toJson();                
        if($("input[name='migrationtype']:checked").val() == 'origin'){
          xVal = centerLayer.featureSet.features[0].attributes.OriginX;
          yVal = centerLayer.featureSet.features[0].attributes.OriginY;
          newPop = centerLayer.featureSet.features[0].attributes.OriginPop;
          newInOut = "Total Emigration: " + centerLayer.featureSet.features[0].attributes.OriginTotOut;
          
        }
        else {
          xVal = centerLayer.featureSet.features[0].attributes.DestX;
          yVal = centerLayer.featureSet.features[0].attributes.DestY;
          newPop = centerLayer.featureSet.features[0].attributes.DestPop;
          newInOut = "Total Immigration: " + centerLayer.featureSet.features[0].attributes.DestTotIn;                
        }
        $(".timepop").text("");    
        $(".timepop").append("Total Population: " + newPop + "<br/>" + newInOut);            
        
        var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
        map.centerAt(CenPoint);
      });

      $(".timetitle").text(""); 
      $(".timetitle").append("<span class='glyphicon glyphicon-time'> </span> Year: " + year);            
      
      $('select').prop('disabled', false);
      // start dialog        
      var highlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255]), 5);

      //close the dialog when the mouse leaves the highlight graphic
      map.on("load", function(){
        map.graphics.enableMouseEvents();
        map.graphics.on("mouse-out", closeDialog);          
      });
                
      //listen for when the onMouseOver event fires on the countiesGraphicsLayer
      //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer       
      featureLayer.on("mouse-over", function(evt){      
        console.log("step2")
        var dataAttr = new Date(  evt.graphic.attributes.year )
        dataAttr.setMonth(dataAttr.getMonth() + 1);       
        map.graphics.clear();     
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry,highlightSymbol);
        
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }        
        if($("input[name='migrationtype']:checked").val() == 'origin'){                    
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(5) + " % of All Immigrants to " + evt.graphic.attributes.Dest  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(5) + " % of Total Population in " + evt.graphic.attributes.Dest + "</li><ul>");
        }
        else {
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Origin + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.POriginTotOut.toFixed(5) + " % of All Emigrants from " + evt.graphic.attributes.Origin  + "</li><br/><li>" + evt.graphic.attributes.POriginPop.toFixed(5) + " % of Total Population in " + evt.graphic.attributes.Origin + "</li><ul>");
        }       
        map.graphics.add(highlightGraphic); 
      });
      mapReady(map);
    });
    // look for time animation button
    $(function () {
      $("#range").ionRangeSlider({
        type: "single",
        min: 1990,
        max: 2013,
        from: 2013,
        to: 2013,
        step: 10,        
        grid: true,
        grid_snap: true,
        /*grid_num: 8,*/
        hide_min_max: true,               
        prettify_enabled: false,
        onChange: function (data) {        
            clearInterval(animationTool)
            year = data.from;           
            $(".alert").remove();
            var timeExtent = new esri.TimeExtent();
            timeExtent.startTime = new Date("01/01/" + year + "UTC");
            timeExtent.endTime = new Date("12/31/" + year + " UTC");
            featureLayer.setTimeDefinition(timeExtent);           
            featureLayer.on('update-end', function(evt) { 
              if($("input[name='migrationtype']:checked").val() == 'origin'){               
                  newPop = evt.target.graphics[0].attributes.OriginPop;
                  newInOut = "Total Emigration: " + evt.target.graphics[0].attributes.OriginTotOut;
              }
              else {                
                  newPop = evt.target.graphics[0].attributes.DestPop;
                  newInOut = "Total Immigration: " + evt.target.graphics[0].attributes.DestTotIn;
              }
              $(".timepop").text("");    
              $(".timepop").append("Total Population: " + newPop +  "<br/>" + newInOut);
            });
            $(".timetitle").text(""); 
            $(".timetitle").append("<span class='glyphicon glyphicon-time'> </span> Year: " + year);                  
          }
      });
    });

    var slider = $("#range").data("ionRangeSlider");
    
    var playing = function() {
        animationTool = window.setInterval(function() {
            if(year == 2013){clearInterval(animationTool); year = 1980; playing();  } 
            year += 10;
            if(year == 2020){year = 2013;}                        
            // change year from 2020 to 2013
            $(".alert").remove();
            var timeExtent = new esri.TimeExtent();
            timeExtent.startTime = new Date("01/01/" + year + "UTC");
            timeExtent.endTime = new Date("12/31/" + year + " UTC");
            featureLayer.setTimeDefinition(timeExtent);
            featureLayer.on('update-end', function(evt) {               
              if($("input[name='migrationtype']:checked").val() == 'origin'){
                newPop = evt.target.graphics[0].attributes.OriginPop;
                newInOut = "Total Emigration: " + evt.target.graphics[0].attributes.OriginTotOut;                
              }
              else {                
                newPop = evt.target.graphics[0].attributes.DestPop;
                newInOut = "Total Immigration: " + evt.target.graphics[0].attributes.DestTotIn;  
              }
              
              $(".timepop").text("");    
              $(".timepop").append("Total Population: " + newPop + "<br/>" + newInOut);
            
            });
            $(".timetitle").text("");    
            $(".timetitle").append("<span class='glyphicon glyphicon-time'> </span> Year: " + year);                       
            slider.update({from: year});
                                   
        }, 1800);
    }

    $("#playbutton").click(function() {playing();$('#playbutton').prop('disabled', true);});
    $("#pausebutton").click(function() {$('#playbutton').prop('disabled', false); clearInterval(animationTool);})    

    // look for a change on the pulldown menu
    $('#dropDownCountry').on('change', function(){
      if(year == 1980){year = 2013}
      $(".alert").remove();
      map.graphics.clear();
      closeDialog();
      map.removeLayer(featureLayer);
      
      featureLayer = new FeatureLayer(migrationlayer, {        
        mode: FeatureLayer.MODE_SNAPSHOT,
        maxAllowableOffset: calcOffset(),
        outFields: ["*"]
      });

      var timeExtent = new esri.TimeExtent();
      timeExtent.startTime = new Date("01/01/" + year + "UTC");
      timeExtent.endTime = new Date("12/31/" + year + " UTC");            
      featureLayer.setTimeDefinition(timeExtent);
      featureLayer.setRenderer(worldrenderer());
      
      if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("Origin = '" + $('select option:selected').text() + "'");}
      else {featureLayer.setDefinitionExpression("Dest = '" + $('select option:selected').text() + "'");}
      
      $('.selectpicker').selectpicker('refresh');
      $('select').attr('disabled','disabled');
      map.addLayer(featureLayer);   
      //graphicId = map.graphicsLayerIds;
      //console.log(graphicId)
      // center the layer extent       
      featureLayer.on("update-end", function(){
        var centerLayer = featureLayer.toJson();                
        if($("input[name='migrationtype']:checked").val() == 'origin'){
          xVal = centerLayer.featureSet.features[0].attributes.OriginX;
          yVal = centerLayer.featureSet.features[0].attributes.OriginY;
          newPop = centerLayer.featureSet.features[0].attributes.OriginPop;
          newInOut = "Total Emigration: " + centerLayer.featureSet.features[0].attributes.OriginTotOut;
          
        }
        else {
          xVal = centerLayer.featureSet.features[0].attributes.DestX;
          yVal = centerLayer.featureSet.features[0].attributes.DestY;
          newPop = centerLayer.featureSet.features[0].attributes.DestPop;
          newInOut = "Total Immigration: " + centerLayer.featureSet.features[0].attributes.DestTotIn;                
        }
        $(".timepop").text("");    
        $(".timepop").append("Total Population: " + newPop + "<br/>" + newInOut);            
        
        var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
        map.centerAt(CenPoint);
      });
      $(".timetitle").text("");    
      $(".timetitle").append("<span class='glyphicon glyphicon-time'> </span> Year: " + year);            
              
      $('select').prop('disabled', false);
      // start dialog        
      var highlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255]), 5);

      //close the dialog when the mouse leaves the highlight graphic
      map.on("load", function(){
        map.graphics.enableMouseEvents();
        map.graphics.on("mouse-out", closeDialog);          
      });
                
      //listen for when the onMouseOver event fires on the countiesGraphicsLayer
      //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer       
      featureLayer.on("mouse-over", function(evt){      
        console.log("step3")
        var dataAttr = new Date(  evt.graphic.attributes.year )
        dataAttr.setMonth(dataAttr.getMonth() + 1);
        map.graphics.clear();     
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry,highlightSymbol);
        
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
          $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }
        if($("input[name='migrationtype']:checked").val() == 'origin'){                    
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(5) + " % of All Immigrants to " + evt.graphic.attributes.Dest  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(5) + " % of Total Population in " + evt.graphic.attributes.Dest + "</li><ul>");
        }
        else {
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Origin + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.POriginTotOut.toFixed(5) + " % of All Emigrants from " + evt.graphic.attributes.Origin  + "</li><br/><li>" + evt.graphic.attributes.POriginPop.toFixed(5) + " % of Total Population in " + evt.graphic.attributes.Origin + "</li><ul>");
        }        
        map.graphics.add(highlightGraphic); 
      });
    mapReady(map);  
  });
    
  function closeDialog() {
        map.graphics.clear();
        //dijit.popup.close(dialog);
    }
  
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  function mapReady(map){    
    myOnClick_connect = dojo.connect(map,"onClick",executeIdentifyTask);      
    //create identify tasks and setup parameters 
    identifyTask = new IdentifyTask(basemap_url);       
    identifyParams = new IdentifyParameters();
    identifyParams.tolerance = 0;
    identifyParams.returnGeometry = false;
    identifyParams.layerIds = [0];
    identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
    identifyParams.width  = map.width;
    identifyParams.height = map.height;
  }
  
  function executeIdentifyTask(evt) {            
    map.graphics.clear();    
    $(".alert").remove();
    if(year == 1980){year = 2013}
    // remove the old SVG from the map
    document.getElementById(map.graphicsLayerIds + "_layer").remove();
    map.graphicsLayerIds = [];
    //map.graphicsLayerIds = [];
    //graphicId = document.getElementById(map.graphicsLayerIds + "_layer"); 
    //graphicId.remove();
    //graphicId = map.graphicsLayerIds;
    
    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
    var deferred = identifyTask.execute(identifyParams);

    deferred.addCallback(function(response) {     
      // response is an array of identify result objects    
      // Let's return an array of features.
      return dojo.map(response, function(result){                       
        map.removeLayer(featureLayer);
        var feature = result.feature;               
        console.log(feature.attributes.COUNTRY);
        
        if(feature.attributes.COUNTRY == "Ocean"){
          //alert("Please, try again. You can click on " + feature.attributes.Name + " that is not a China Province")
          var bootstrap_alert = function() {};        
          bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-danger"><span>'+message+'</span></div>')
          }
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>You have clicked on the Ocean. Please, try again!<br/> The visualization is still set to <b>" + $('select option:selected').text() + "</b>.</li></ul>");
          window.setTimeout( function(){$(".alert").slideUp();}, 5000);
          //console.log($('select option:selected').text())
          //$('select').val($('select option:selected').text());
          //$('.selectpicker').selectpicker('refresh');
        }
        else{
          $('select').val(feature.attributes.COUNTRY);
          $('.selectpicker').selectpicker('refresh');      
        }  
        //if($.inArray(feature.attributes.COUNTRY, tags ) == -1){map.removeLayer(featureLayer); mapReady(map);}       
        //closeDialog();
        featureLayer = new FeatureLayer(migrationlayer, {
          mode: FeatureLayer.MODE_SNAPSHOT,
          maxAllowableOffset: calcOffset(),
          outFields: ["*"]
        });
            
        featureLayer.setRenderer(worldrenderer());
        
        if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("Origin = '" + $('select option:selected').text() + "'");}
        else {featureLayer.setDefinitionExpression("Dest = '" + $('select option:selected').text() + "'");}
        var timeExtent = new esri.TimeExtent();
        timeExtent.startTime = new Date("01/01/" + year + "UTC");
        timeExtent.endTime = new Date("12/31/" + year + " UTC");
        featureLayer.setTimeDefinition(timeExtent);      
        map.addLayer(featureLayer);
        
        //console.log(map.graphicsLayerIds);
        // center the layer extent 
        featureLayer.on("update-end", function(){
          var centerLayer = featureLayer.toJson();          
          if($("input[name='migrationtype']:checked").val() == 'origin'){
            xVal = centerLayer.featureSet.features[0].attributes.OriginX;
            yVal = centerLayer.featureSet.features[0].attributes.OriginY;
            newPop = centerLayer.featureSet.features[0].attributes.OriginPop;
            newInOut = "Total Emigration: " + centerLayer.featureSet.features[0].attributes.OriginTotOut;
          }
          else {
            xVal = centerLayer.featureSet.features[0].attributes.DestX;
            yVal = centerLayer.featureSet.features[0].attributes.DestY;
            newPop = centerLayer.featureSet.features[0].attributes.DestPop;
            newInOut = "Total Immigration: " + centerLayer.featureSet.features[0].attributes.DestTotIn;                
          }
          $(".timepop").text("");    
          $(".timepop").append("Total Population: " + newPop + "<br/>" + newInOut);            
        
          var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
          map.centerAt(CenPoint);
          //console.log("Layer up")
          dojo.connect(map,"onClick",executeIdentifyTask);
          mapReady(map);  
        });
        $(".timetitle").text("");    
        $(".timetitle").append("<span class='glyphicon glyphicon-time'> </span> Year: " + year);            
        
        // start dialog        
        var highlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255]), 5);

        //close the dialog when the mouse leaves the highlight graphic
        map.on("load", function(){
          map.graphics.enableMouseEvents();
          map.graphics.on("mouse-out", closeDialog);          
        });
          
        //listen for when the onMouseOver event fires on the countiesGraphicsLayer
        //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer       
        featureLayer.on("mouse-over", function(evt){        
          map.graphics.clear();
          var dataAttr = new Date(  evt.graphic.attributes.year )
          dataAttr.setMonth(dataAttr.getMonth() + 1);       
          var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);
          //dojo.byId("current_map").innerHTML = "<ul><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>";
          var bootstrap_alert = function() {};        
          bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')

          }
          if($("input[name='migrationtype']:checked").val() == 'origin'){                    
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(5) + " % of All Immigrants to " + evt.graphic.attributes.Dest  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(5) + " % of Total Population in " + evt.graphic.attributes.Dest + "</li><ul>");
          }
          else {
            bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Origin + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.POriginTotOut.toFixed(5) + " % of All Emigrants from " + evt.graphic.attributes.Origin  + "</li><br/><li>" + evt.graphic.attributes.POriginPop.toFixed(5) + " % of Total Population in " + evt.graphic.attributes.Origin + "</li><ul>");
          }
          map.graphics.add(highlightGraphic); 
        }); 
        
      });
      
    });

  } 
});

  

      
