dojo.ready(function () {  
  var countryArray = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "Channel Islands", "Chile", "China", "China Hong Kong", "China Macao", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czech Republic", "Democratic Peoples Republic Korea", "Democratic Republic Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Faeroe Islands", "Falkland Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of Korea", "Republic of Moldova", "Romania", "Russian Federation", "Rwanda", "Réunion", "Saint Helena", "Saint Kitts Nevis", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "State of Palestine", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Tajikistan", "Thailand", "The former Yugoslav Republic Macedonia", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United Republic Tanzania", "United States Virgin Islands", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Wallis Futuna Islands", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"];

  $.each(countryArray, function(val, text) {
    $('select option:contains("Austria")').prop('selected',true);
    $('#dropDownCountry').append( $('<option></option>').val(text).html(text));
  });
  
  $('.selectpicker').selectpicker();

  $("#about").click(function(e){
    $("#aboutModal").modal("show"); 
    $("body").css("margin-right","0px");
    $(".navbar").css("margin-right","0px");          
  });

   

});

var map, featureLayer, dialog, featureJSON, identifyTask, identifyParams, myOnClick_connect, tags, last_tags, graphicId;

require(["esri/map", "application/bootstrapmap", "esri/layers/FeatureLayer", "esri/tasks/IdentifyTask", "esri/dijit/Legend", "esri/graphic", 
  "esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/renderers/ClassBreaksRenderer", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
  "esri/layers/ArcGISTiledMapServiceLayer", "esri/geometry/Point", "dojo/on", "dojo/domReady!"], 
  function(Map, BootstrapMap, FeatureLayer, IdentifyTask, Legend, Graphic, SimpleLineSymbol, SimpleFillSymbol, ClassBreaksRenderer, 
    IdentifyTask, IdentifyParameters, ArcGISTiledMapServiceLayer, Point, on) {   
    
    map = BootstrapMap.create("mapDiv",{center: [20, 30],zoom: 3});
        
    var basemap = new ArcGISTiledMapServiceLayer("http://cga2.cga.harvard.edu/arcgis/rest/services/migration/basemap/MapServer");
    var migrationlayer = "http://cga1.cga.harvard.edu/arcgis/rest/services/immigration/migration_lines_curve_gen_new1/MapServer/0"
    dojo.connect(map, "onLoad", initOperationalLayersFirst);
    dojo.connect(map, "onLoad", mapReady);      
    dojo.connect(map, 'onZoomEnd', function() {
      maxOffset = calcOffset();
      featureLayer.setMaxAllowableOffset(maxOffset);
    });
    map.addLayer(basemap);

    function calcOffset() {
      return (map.extent.getWidth() / map.width);
    }    

    function initOperationalLayersFirst() {            
      var symbol = new SimpleFillSymbol();
      var renderer = new ClassBreaksRenderer(symbol, "Migr_Stock");
      renderer.addBreak({minValue: 1, maxValue: 1001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), label: "1 - 1,000"});
      renderer.addBreak({minValue: 1001, maxValue: 10001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), label: "1,001 - 10,000"});
      renderer.addBreak({minValue: 10001, maxValue: 100001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,0]), 2), label: "10,001 - 100,000"});
      renderer.addBreak({minValue: 100001, maxValue: 1000001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,128,0]), 2), label: "100,001 - 1,000,000"});
      renderer.addBreak({minValue: 1000001, maxValue: 12960000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), label: "1,000,000 +"}); 

      featureLayer = new FeatureLayer(migrationlayer, {
        mode: FeatureLayer.MODE_ONDEMAND,
        maxAllowableOffset: calcOffset(),
        outFields: ["Ctry1", "Ctry2", "Migr_Stock", "Share_of_Total_Stock", "Share_of_Total_Pop"],
        supportsAdvancedQueries: true
      });
    
      featureLayer.setRenderer(renderer);
      featureLayer.setDefinitionExpression("Ctry1 = 'Austria'");
      featureLayer.setOpacity(.90);
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
        map.graphics.clear();       
        var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);      
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }
        bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>");
        //window.setTimeout( function(){$(".alert").slideUp();}, 15000);
        map.graphics.add(highlightGraphic); 
      });
      graphicId = map.graphicsLayerIds;
      //console.log(graphicId)
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
    }

    // look for the radio buttona change 
    $("input").on("change",function(){
      console.log($("input[name='migrationtype']:checked").val())      
      map.graphics.clear();
      closeDialog();
      map.removeLayer(featureLayer);
      var symbol = new SimpleFillSymbol();    
      var renderer = new ClassBreaksRenderer(symbol, "Migr_Stock");
      renderer.addBreak({minValue: 1, maxValue: 1001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), label: "1 - 1,000"});
      renderer.addBreak({minValue: 1001, maxValue: 10001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), label: "1,001 - 10,000"});
      renderer.addBreak({minValue: 10001, maxValue: 100001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,0]), 2), label: "10,001 - 100,000"});
      renderer.addBreak({minValue: 100001, maxValue: 1000001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,128,0]), 2), label: "100,001 - 1,000,000"});
      renderer.addBreak({minValue: 1000001, maxValue: 12960000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), label: "1,000,000 +"});   

      featureLayer = new FeatureLayer(migrationlayer, {
        mode: FeatureLayer.MODE_SNAPSHOT,
        maxAllowableOffset: calcOffset(),
        outFields: ["Ctry1", "Ctry2", "Migr_Stock", "X_Coord_1", "Y_Coord_1", "Share_of_Total_Stock", "Share_of_Total_Pop","X_Coord_2", "Y_Coord_2"]
      });
      featureLayer.setRenderer(renderer);
      //console.log($('select option:selected').text());
      if($("input[name='migrationtype']:checked").val() != 'origin'){featureLayer.setDefinitionExpression("Ctry2 = '" + $('select option:selected').text() + "'");}
      else {featureLayer.setDefinitionExpression("Ctry1 = '" + $('select option:selected').text() + "'");}
      $('.selectpicker').selectpicker('refresh');
      $('select').attr('disabled','disabled');
      map.addLayer(featureLayer);   
      graphicId = map.graphicsLayerIds;
      console.log(graphicId)
      // center the layer extent       
      featureLayer.on("UpdateEnd", function(){
        var centerLayer = featureLayer.toJson();        
        if($("input[name='migrationtype']:checked").val() != 'origin'){
          xVal = centerLayer.featureSet.features[0].attributes.X_Coord_2
          yVal = centerLayer.featureSet.features[0].attributes.Y_Coord_2
        }
        else {
          xVal = centerLayer.featureSet.features[0].attributes.X_Coord_1
          yVal = centerLayer.featureSet.features[0].attributes.Y_Coord_1                
        }
        var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
        map.centerAt(CenPoint);
      });      
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
        map.graphics.clear();     
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry,highlightSymbol);
        //dojo.byId("current_map").innerHTML = "<ul><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>";
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }
        
        if($("input[name='migrationtype']:checked").val() != 'origin'){          
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Ctry1 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>");
        }
        else {
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>");
        }
       
        map.graphics.add(highlightGraphic); 
      });
      mapReady(map);
    });
    
    // look for a change on the pulldown menu
    $('#dropDownCountry').on('change', function(){
      console.log($("input[name='migrationtype']:checked").val())
      map.graphics.clear();
      closeDialog();
      map.removeLayer(featureLayer);
        
      var symbol = new SimpleFillSymbol();    
      var renderer = new ClassBreaksRenderer(symbol, "Migr_Stock");
      renderer.addBreak({minValue: 1, maxValue: 1001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), label: "1 - 1,000"});
      renderer.addBreak({minValue: 1001, maxValue: 10001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), label: "1,001 - 10,000"});
      renderer.addBreak({minValue: 10001, maxValue: 100001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,0]), 2), label: "10,001 - 100,000"});
      renderer.addBreak({minValue: 100001, maxValue: 1000001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,128,0]), 2), label: "100,001 - 1,000,000"});
      renderer.addBreak({minValue: 1000001, maxValue: 12960000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), label: "1,000,000 +"});   

      featureLayer = new FeatureLayer(migrationlayer, {
        mode: FeatureLayer.MODE_SNAPSHOT,
        maxAllowableOffset: calcOffset(),
        outFields: ["Ctry1", "Ctry2", "Migr_Stock", "X_Coord_1", "Y_Coord_1", "Share_of_Total_Stock", "Share_of_Total_Pop","X_Coord_2", "Y_Coord_2"]
      });

      featureLayer.setRenderer(renderer);     
      
      if($("input[name='migrationtype']:checked").val() != 'origin'){featureLayer.setDefinitionExpression("Ctry2 = '" + $('select option:selected').text() + "'");}
      else{featureLayer.setDefinitionExpression("Ctry1 = '" + $('select option:selected').text() + "'");}
      
      $('.selectpicker').selectpicker('refresh');
      $('select').attr('disabled','disabled');
      map.addLayer(featureLayer);   
      graphicId = map.graphicsLayerIds;
      console.log(graphicId)
      // center the layer extent       
      featureLayer.on("UpdateEnd", function(){
        var centerLayer = featureLayer.toJson();                
        if($("input[name='migrationtype']:checked").val() != 'origin'){
          xVal = centerLayer.featureSet.features[0].attributes.X_Coord_2
          yVal = centerLayer.featureSet.features[0].attributes.Y_Coord_2
        }
        else {
          xVal = centerLayer.featureSet.features[0].attributes.X_Coord_1
          yVal = centerLayer.featureSet.features[0].attributes.Y_Coord_1                
        }
        var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
        map.centerAt(CenPoint);
      });      
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
        map.graphics.clear();     
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry,highlightSymbol);
        //dojo.byId("current_map").innerHTML = "<ul><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>";
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }
        if($("input[name='migrationtype']:checked").val() != 'origin'){
          
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Ctry1 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>");
        }
        else {
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>");
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
    identifyTask = new IdentifyTask("http://cga2.cga.harvard.edu/arcgis/rest/services/migration/basemap/MapServer");       
    identifyParams = new IdentifyParameters();
    identifyParams.tolerance = 0;
    identifyParams.returnGeometry = false;
    identifyParams.layerIds = [0];
    identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
    identifyParams.width  = map.width;
    identifyParams.height = map.height;   
  }

  function executeIdentifyTask(evt) {        
    //dojo.disconnect(myOnClick_connect);
    map.graphics.clear(); 
    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
    var deferred = identifyTask.execute(identifyParams);        
    // remove the old SVG from the map
    graphicId = document.getElementById(map.graphicsLayerIds[0] + "_layer")  
    graphicId.remove();
    
    //console.log(graphicId)
    
    deferred.addCallback(function(response) {     
      // response is an array of identify result objects    
      // Let's return an array of features.
      return dojo.map(response, function(result){                       
        map.removeLayer(featureLayer);        
        var feature = result.feature;               
        $('select').val(feature.attributes.COUNTRY);
        $('.selectpicker').selectpicker('refresh');      
        if($.inArray(feature.attributes.COUNTRY, tags ) == -1){map.removeLayer(featureLayer); mapReady(map);}       
        //closeDialog();
        
        var symbol = new SimpleFillSymbol();
      
        var renderer = new ClassBreaksRenderer(symbol, "Migr_Stock");
        renderer.addBreak({minValue: 1, maxValue: 1001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), label: "1 - 1,000"});
        renderer.addBreak({minValue: 1001, maxValue: 10001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), label: "1,001 - 10,000"});
        renderer.addBreak({minValue: 10001, maxValue: 100001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,0]), 2), label: "10,001 - 100,000"});
        renderer.addBreak({minValue: 100001, maxValue: 1000001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,128,0]), 2), label: "100,001 - 1,000,000"});
        renderer.addBreak({minValue: 1000001, maxValue: 12960000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), label: "1,000,000 +"});   

        featureLayer = new FeatureLayer(migrationlayer, {
          mode: FeatureLayer.MODE_SNAPSHOT,
          maxAllowableOffset: calcOffset(),
          outFields: ["Ctry1", "Ctry2", "Migr_Stock", "X_Coord_1", "Y_Coord_1", "Share_of_Total_Stock", "Share_of_Total_Pop","X_Coord_2", "Y_Coord_2"]
        });
            
        featureLayer.setRenderer(renderer);
        //featureLayer.setDefinitionExpression("Ctry1 = '" + feature.attributes.COUNTRY + "'");
        if($("input[name='migrationtype']:checked").val() != 'origin'){featureLayer.setDefinitionExpression("Ctry2 = '" + feature.attributes.COUNTRY + "'");}
        else{featureLayer.setDefinitionExpression("Ctry1 = '" + feature.attributes.COUNTRY + "'");}      
        map.addLayer(featureLayer);
        //console.log(map.graphicsLayerIds);
        // center the layer extent 
        featureLayer.on("UpdateEnd", function(){
          var centerLayer = featureLayer.toJson();          
          if($("input[name='migrationtype']:checked").val() != 'origin'){
            xVal = centerLayer.featureSet.features[0].attributes.X_Coord_2
            yVal = centerLayer.featureSet.features[0].attributes.Y_Coord_2
          }
          else {
            xVal = centerLayer.featureSet.features[0].attributes.X_Coord_1
            yVal = centerLayer.featureSet.features[0].attributes.Y_Coord_1                
          }
          var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
          map.centerAt(CenPoint);
          //console.log("Layer up")
          //dojo.connect(map,"onClick",executeIdentifyTask);
          //mapReady(map);  
        });
        
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
          var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);
          //dojo.byId("current_map").innerHTML = "<ul><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>";
          var bootstrap_alert = function() {};        
          bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
          }
          if($("input[name='migrationtype']:checked").val() != 'origin'){
            bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Ctry1 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>");
          }
          else {
            bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Ctry2 + ": " +  numberWithCommas(evt.graphic.attributes.Migr_Stock) + "</li><br/><li>As Share of Total Stock: " + Math.round(evt.graphic.attributes.Share_of_Total_Stock*100)/100  + "%</li><br/><li>As Share of Total Population: " + Math.round(evt.graphic.attributes.Share_of_Total_Pop*100)/100 + "%</li></ul>");
          }
          map.graphics.add(highlightGraphic); 
        }); 
        
      });
      
    });   
  } 

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-46421302-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })(); 


});

  

      