dojo.ready(function () { 
  var countryArray = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Puerto Rico","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

  $.each(countryArray, function(val, text) {$('#dropDownCountry').append( $('<option></option>').val(text).html(text));});
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

var map, featureLayer, dialog, featureJSON, identifyTask, identifyParams, myOnClick_connect, tags, last_tags, animationTool, 
year = 2004, newPop, newInOut;


require(["esri/map", "application/bootstrapmap", "esri/layers/FeatureLayer", "esri/tasks/IdentifyTask", "esri/dijit/Legend", "esri/graphic", 
  "esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/renderers/ClassBreaksRenderer", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
  "esri/layers/ArcGISTiledMapServiceLayer", "esri/geometry/Point", "esri/TimeExtent", "esri/dijit/TimeSlider","dojo/on", "dojo/domReady!"], 
  function(Map, BootstrapMap, FeatureLayer, IdentifyTask, Legend, Graphic, SimpleLineSymbol, SimpleFillSymbol, ClassBreaksRenderer, 
    IdentifyTask, IdentifyParameters, ArcGISTiledMapServiceLayer, Point, TimeExtent, TimeSlider, on) {   
    
    map = BootstrapMap.create("mapDiv",{center: [-95, 40],zoom: 5});
    var migrationlayer = "http://cga-app01.cadm.harvard.edu/arcgis/rest/services/crossroadofmigration/migration/MapServer/0"
    var basemap_url = "http://cga-app01.cadm.harvard.edu/arcgis/rest/services/crossroadofmigration/basemapocean/MapServer"

    var basemap = new ArcGISTiledMapServiceLayer(basemap_url);
    
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
    
    function usarenderer(){
      var symbol = new SimpleFillSymbol();
      var renderer = new ClassBreaksRenderer(symbol, "Count");
      renderer.addBreak({minValue: 0, maxValue: 250, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), label: "1 - 250"});
      renderer.addBreak({minValue: 251, maxValue: 500, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), label: "251 - 500"});
      renderer.addBreak({minValue: 501, maxValue: 1000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,0]), 2), label: "501 - 1,000"});
      renderer.addBreak({minValue: 1001, maxValue: 2500, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,128,0]), 2), label: "1,001 - 2,500"});
      renderer.addBreak({minValue: 2501, maxValue: 5000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), label: "2,501 - 5,001"});
      renderer.addBreak({minValue: 5001, maxValue: 118552, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,255]), 2), label: "5,001 +"});  
      return renderer;
    }       

    function initOperationalLayersFirst() {                  
      featureLayer = new FeatureLayer(migrationlayer, {
        mode: FeatureLayer.MODE_SNAPSHOT,        
        maxAllowableOffset: calcOffset(),
        outFields: ["*"],
        supportsAdvancedQueries: true
      });     
    
      featureLayer.setRenderer(usarenderer());      
      featureLayer.setDefinitionExpression("Origin = 'Alabama'");
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
        console.log("step1")
        map.graphics.clear();       
        var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);      
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
    }   

    // look for the origin/destination radio button change 
    $("input[name='migrationtype']").on("change",function(){           
      if(year == 2004){year = 2013}
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
      featureLayer.setRenderer(usarenderer());
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
          //xVal = centerLayer.featureSet.features[0].attributes.ToX;
          //yVal = centerLayer.featureSet.features[0].attributes.ToY;
          newPop = centerLayer.featureSet.features[0].attributes.OriginPop;
          newInOut = "Total Emigration: " + centerLayer.featureSet.features[0].attributes.OriginTotOut;
          
        }
        else {
          //xVal = centerLayer.featureSet.features[0].attributes.FromX;
          //yVal = centerLayer.featureSet.features[0].attributes.FromY;
          newPop = centerLayer.featureSet.features[0].attributes.DestPop;
          newInOut = "Total Immigration: " + centerLayer.featureSet.features[0].attributes.DestTotIn;                                
        }       
        //var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
        //map.centerAt(CenPoint);
        $(".timepop").text(""); 
        $(".timepop").append("Total Population: " + newPop + "<br/>" + newInOut);            
      
      });
      //console.log(year) 
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
        //console.log("step2")
        
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
        min: 2005,
        max: 2013,
        from: 2013,
        to: 2013,
        step: 1,       
        grid: true,
        grid_snap: true,
        grid_num: 8,
        hide_min_max: true,               
        prettify_enabled: false,
        onChange: function (data) {        
            //clearInterval(animationTool);
            console.log(year)
            $(".alert").remove(); 
            year = data.from;
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
        }
      });
    });

    var slider = $("#range").data("ionRangeSlider"); 
    
    var playing = function() {               
        animationTool = window.setInterval(function() {
            if(year == 2013){clearInterval(animationTool); year = 2004; playing(); slider.reset();} 
            year++; 
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
    $("#pausebutton").click(function() {$('#playbutton').prop('disabled', false);clearInterval(animationTool);  
    })   

    // look for a change on the pulldown menu
    $('#dropDownCountry').on('change', function(){
      if(year == 2004){year = 2013}
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
      featureLayer.setRenderer(usarenderer());
      
      if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("Origin = '" + $('select option:selected').text() + "'");}
      else{featureLayer.setDefinitionExpression("Dest = '" + $('select option:selected').text() + "'");}
      
      $('.selectpicker').selectpicker('refresh');
      $('select').attr('disabled','disabled');
      map.addLayer(featureLayer);   
      //graphicId = map.graphicsLayerIds;
      //console.log(graphicId)
      // center the layer extent       
      featureLayer.on("update-end", function(){
        var centerLayer = featureLayer.toJson();        
        if($("input[name='migrationtype']:checked").val() == 'origin'){
          //xVal = centerLayer.featureSet.features[0].attributes.ToX;
          //yVal = centerLayer.featureSet.features[0].attributes.ToY;
          newPop = centerLayer.featureSet.features[0].attributes.OriginPop;
          newInOut = "Total Emigration: " + centerLayer.featureSet.features[0].attributes.OriginTotOut;
          
        }
        else {
          //xVal = centerLayer.featureSet.features[0].attributes.FromX;
          //yVal = centerLayer.featureSet.features[0].attributes.FromY;
          newPop = centerLayer.featureSet.features[0].attributes.DestPop;
          newInOut = "Total Immigration: " + centerLayer.featureSet.features[0].attributes.DestTotIn;                                
        }
        $(".timepop").text("");    
        $(".timepop").append("Total Population: " + newPop + "<br/>" + newInOut);            
        
        //var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
        //map.centerAt(CenPoint);
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
    if(year == 2004){year = 2013}
    $(".alert").remove();  
    map.graphics.clear();    
    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
    var deferred = identifyTask.execute(identifyParams);        
    // remove the old SVG from the map

    graphicId = document.getElementById(map.graphicsLayerIds + "_layer");      
    console.log(graphicId);
    graphicId.remove();
    //document.getElementById(map.graphicsLayerIds + "_layer").remove(); 
    map.graphicsLayerIds = [];

    deferred.addCallback(function(response) {     
      // response is an array of identify result objects    
      // Let's return an array of features.
      return dojo.map(response, function(result){                       
        map.removeLayer(featureLayer);
        var feature = result.feature;               
        if(feature.attributes.OBJECTID > 83){
          //alert("Please, try again. You can click on " + feature.attributes.Name + " that is not a China Province")
          var bootstrap_alert = function() {};        
          bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-danger"><span>'+message+'</span></div>')
          }
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>Please, try again! You have clicked on <b>" + feature.attributes.Name + "</b> that is not a USA State.</li></ul>");
          window.setTimeout( function(){$(".alert").slideUp();}, 5000);
        }       
  
        $('select').val(feature.attributes.Name);
        $('.selectpicker').selectpicker('refresh');      
        //if($.inArray(feature.attributes.STATE_NAME, tags ) == -1){map.removeLayer(featureLayer); mapReady(map);}       
        //closeDialog();        
      
        featureLayer = new FeatureLayer(migrationlayer, {
          mode: FeatureLayer.MODE_SNAPSHOT,
          maxAllowableOffset: calcOffset(),
          outFields: ["*"]
        });
            
        featureLayer.setRenderer(usarenderer());
        //featureLayer.setDefinitionExpression("From_ = '" + feature.attributes.STATE_NAME + "'");
        if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("Origin = '" + $('select option:selected').text() + "'");}
        else{featureLayer.setDefinitionExpression("Dest = '" + $('select option:selected').text() + "'");}
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
            //xVal = centerLayer.featureSet.features[0].attributes.ToX;
            //yVal = centerLayer.featureSet.features[0].attributes.ToY;
            newPop = centerLayer.featureSet.features[0].attributes.OriginPop;
            newInOut = "Total Emigration: " + centerLayer.featureSet.features[0].attributes.OriginTotOut;
            
          }
          else {
            //xVal = centerLayer.featureSet.features[0].attributes.FromX;
            //yVal = centerLayer.featureSet.features[0].attributes.FromY;
            newPop = centerLayer.featureSet.features[0].attributes.DestPop;
            newInOut = "Total Immigration: " + centerLayer.featureSet.features[0].attributes.DestTotIn;                                
          }
          $(".timepop").text("");    
          $(".timepop").append("Total Population: " + newPop + "<br/>" + newInOut);            
          
          //var CenPoint = new Point({ "x": xVal, "y": yVal, " spatialReference": { " wkid": 102100 } });
          //map.centerAt(CenPoint);
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

  

      
