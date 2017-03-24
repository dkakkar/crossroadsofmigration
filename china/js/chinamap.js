var countryArray = ['安徽省 - Anhui','北京市 - Beijing','福建省 - Fujian','甘肃省 - Gansu','广东省 - Guangdong','广西壮族自治区 - Guangxi','贵州省 - Guizhou','海南省 - Hainan','河北省 - Hebei','黑龙江省 - Heilongjiang','河南省 - Henan','湖北省 - Hubei','湖南省 - Hunan','江苏省 - Jiangsu','江西省 - Jiangxi','吉林省 - Jilin','辽宁省 - Liaoning','内蒙古自治区 - Neimenggu','宁夏回族自治区 - Ningxia','青海省 - Qinghai','陕西省 - Shaanxi','山东省 - Shandong','上海市 - Shanghai','山西省 - Shanxi','四川省 - Sichuan','天津市 - Tianjin','新疆维吾尔自治区 - Xinjiang','西藏自治区 - Xizang','云南省 - Yunnan','浙江省 - Zhejiang'];
var countryArrayEn = ["Anhui", "Beijing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Neimenggu", "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", "Tianjin", "Xinjiang", "Xizang", "Yunnan", "Zhejiang"];

dojo.ready(function () {   
  $.each(countryArray, function(val, text) {$('#dropDownCountry').append( $('<option></option>').val(text).html(text));
  });
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

var map, featureLayer, dialog, featureJSON, identifyTask, identifyParams, myOnClick_connect, tags, last_tags, graphicId,
animationTool, year = 1990, newPop, newInOut;


require(["esri/map", "application/bootstrapmap", "esri/layers/FeatureLayer", "esri/tasks/IdentifyTask", "esri/dijit/Legend", "esri/graphic", 
  "esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/renderers/ClassBreaksRenderer", "esri/renderers/UniqueValueRenderer","esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
  "esri/layers/ArcGISTiledMapServiceLayer", "esri/geometry/Point", "esri/TimeExtent", "esri/dijit/TimeSlider","dojo/on", "dojo/domReady!"], 
  function(Map, BootstrapMap, FeatureLayer, IdentifyTask, Legend, Graphic, SimpleLineSymbol, SimpleFillSymbol, ClassBreaksRenderer,UniqueValueRenderer, 
    IdentifyTask, IdentifyParameters, ArcGISTiledMapServiceLayer, Point, TimeExtent, TimeSlider, on) {   
    
    map = BootstrapMap.create("mapDiv",{center: [101.211017,34.634035],zoom: 5});
    
    var migrationlayer = "http://cga-app01.cadm.harvard.edu/arcgis/rest/services/crossroadofmigration/migration/MapServer/1"
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

    function chinarenderer(){
        var symbol = new SimpleFillSymbol();
        var renderer = new ClassBreaksRenderer(symbol, "Count");
        renderer.addBreak({minValue: 0, maxValue: 5000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), label: "1 - 5,000"});
        renderer.addBreak({minValue: 5001, maxValue: 10000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), label: "5,001 - 10,000"});
        renderer.addBreak({minValue: 10001, maxValue: 25000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,0]), 2), label: "10,001 - 25,000"});
        renderer.addBreak({minValue: 25001, maxValue: 50000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,128,0]), 2), label: "25,001 - 50,000"});
        renderer.addBreak({minValue: 50001, maxValue: 100000, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), label: "50,001 - 100,000"});
        renderer.addBreak({minValue: 100001, maxValue: 3187200, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,255]), 2), label: "100,001 +"}); 
        return renderer;
    }

    function initOperationalLayersFirst() {                  
      featureLayer = new FeatureLayer(migrationlayer, {
        mode: FeatureLayer.MODE_SNAPSHOT,
        maxAllowableOffset: calcOffset(),
        outFields: ["*"],
        supportsAdvancedQueries: true
      });     
    
      featureLayer.setRenderer(chinarenderer()); 
      featureLayer.setDefinitionExpression("Origin = '安徽省'");
      featureLayer.setOpacity(.90);
      var timeExtent = new esri.TimeExtent();
      timeExtent.startTime = new Date("01/01/2010 UTC");
      timeExtent.endTime = new Date("12/31/2010 UTC");      
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
        map.graphics.clear();       
        var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);      
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
           $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }
        bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(3) + " % of All Immigrants to " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(3) + " % of Total Population in " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + "</li><ul>");
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

    // look for the radio button change 
    //$("input").on("change",function(){
    $("input[name='migrationtype']").on("change",function(){  
      if(year == 1990){year = 2010}
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
      featureLayer.setRenderer(chinarenderer());
      //console.log($('select option:selected').text());
      if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("Origin = '" + $('select option:selected').text().split(' - ')[0] + "'");}
      else {featureLayer.setDefinitionExpression("Dest = '" + $('select option:selected').text().split(' - ')[0] + "'");}
      $('.selectpicker').selectpicker('refresh');
      $('select').attr('disabled','disabled');
      map.addLayer(featureLayer);   
      graphicId = map.graphicsLayerIds;
      console.log(graphicId)
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
        map.graphics.clear();     
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry,highlightSymbol);        
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }        
        if($("input[name='migrationtype']:checked").val() == 'origin'){                    
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(3) + " % of All Immigrants to " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(3) + " % of Total Population in " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + "</li><ul>");
        }
        else {
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Origin + " - " + evt.graphic.attributes.OriginEN + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.POriginTotOut.toFixed(3) + "% of All Emigrants from " + evt.graphic.attributes.Origin  + " - " + evt.graphic.attributes.OriginEN + "</li><br/><li>" + evt.graphic.attributes.POriginPop.toFixed(3) + " % of Total Population in " + evt.graphic.attributes.Origin + " - " + evt.graphic.attributes.OriginEN + "</li><ul>");
        }       
        map.graphics.add(highlightGraphic); 
      });
      mapReady(map);
    });
    
    // look for time animation button
    $(function () {
      $("#range").ionRangeSlider({
        type: "single",
        min: 1995,
        max: 2010,
        from: 2010,
        to: 2010,
        step: 5,
        grid: true,
        grid_snap: true,
        grid_num: 3,
        hide_min_max: true,               
        prettify_enabled: false,
        onChange: function (data) {        
            clearInterval(animationTool);
            $(".alert").remove(); 
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
            if(year == 2010){clearInterval(animationTool); year = 1990;playing();slider.reset();}
            year+=5;
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
      if(year == 1990){year = 2010}
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
      timeExtent.startTime = new Date("01/01/"+ year + "UTC");
      timeExtent.endTime = new Date("12/31/"+ year + "UTC");      
      featureLayer.setTimeDefinition(timeExtent);
      featureLayer.setRenderer(chinarenderer());     
      
      if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("Origin = '" + $('select option:selected').text().split(" - ")[0] + "'");}
      else{featureLayer.setDefinitionExpression("Dest = '" + $('select option:selected').text().split(" - ")[0] + "'");}
      
      $('.selectpicker').selectpicker('refresh');
      $('select').attr('disabled','disabled');
      map.addLayer(featureLayer);   
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
        map.graphics.clear();     
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry,highlightSymbol);
        var bootstrap_alert = function() {};        
        bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
        }
        if($("input[name='migrationtype']:checked").val() == 'origin'){                    
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(3) + " % of All Immigrants to " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(3) + " % of Total Population in " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + "</li><ul>");
        }
        else {
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Origin + " - " + evt.graphic.attributes.OriginEN + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.POriginTotOut.toFixed(3) + " % of All Emigrants from " + evt.graphic.attributes.Origin  + " - " + evt.graphic.attributes.OriginEN + "</li><br/><li>" + evt.graphic.attributes.POriginPop.toFixed(3) + " % of Total Population in " + evt.graphic.attributes.Origin + " - " + evt.graphic.attributes.OriginEN + "</li><ul>");
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
    if(year == 1990){year = 2010}
    $(".alert").remove(); 
    map.graphics.clear(); 
    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
    var deferred = identifyTask.execute(identifyParams); 
          
    // remove the old SVG from the map
    graphicId = document.getElementById(map.graphicsLayerIds[0] + "_layer")  
    graphicId.remove();  
    
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
          bootstrap_alert.info("<ul class='alertCountryInfo'><li>Please, try again! You have clicked on <b>" + feature.attributes.Name + "</b> that is not a China Province.</li></ul>");
          window.setTimeout( function(){$(".alert").slideUp();}, 5000);
        }       
        // selection english name version
        $('select').val(countryArray[countryArrayEn.indexOf(feature.attributes.Name)]);
        $('.selectpicker').selectpicker('refresh');      
        //if($.inArray(feature.attributes.Name, tags ) == -1){map.removeLayer(featureLayer); mapReady(map);}       
        //closeDialog();
        
        featureLayer = new FeatureLayer(migrationlayer, {
          mode: FeatureLayer.MODE_SNAPSHOT,
          maxAllowableOffset: calcOffset(),
          outFields: ["*"]
        });
            
        featureLayer.setRenderer(chinarenderer());
        
        if($("input[name='migrationtype']:checked").val() == 'origin'){featureLayer.setDefinitionExpression("OriginEN = '" + feature.attributes.Name + "'");}
        else{featureLayer.setDefinitionExpression("DestEN = '" + feature.attributes.Name+ "'");}
        var timeExtent = new esri.TimeExtent();
        timeExtent.startTime = new Date("01/01/" + year + "UTC");
        timeExtent.endTime = new Date("12/31/" + year + " UTC");
        featureLayer.setTimeDefinition(timeExtent);              
        map.addLayer(featureLayer);
        
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
          
          var bootstrap_alert = function() {};        
          bootstrap_alert.info = function(message) {
            $('#alert_placeholder').html('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert">&times</button><span>'+message+'</span></div>')
          }
          if($("input[name='migrationtype']:checked").val() == 'origin'){                    
            bootstrap_alert.info("<ul class='alertCountryInfo'><li>To " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.PDestTotIn.toFixed(3) + " % of All Immigrants to " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN  + "</li><br/><li>" + evt.graphic.attributes.PDestPop.toFixed(3) + " % of Total Population in " + evt.graphic.attributes.Dest + " - " + evt.graphic.attributes.DestEN + "</li><ul>");
          }
          else {
            bootstrap_alert.info("<ul class='alertCountryInfo'><li>From " + evt.graphic.attributes.Origin + " - " + evt.graphic.attributes.OriginEN + ": " +  numberWithCommas(evt.graphic.attributes.Count) + "</li><br/><li>" + evt.graphic.attributes.POriginTotOut.toFixed(3) + " % of All Emigrants from " + evt.graphic.attributes.Origin  + " - " + evt.graphic.attributes.OriginEN + "</li><br/><li>" + evt.graphic.attributes.POriginPop.toFixed(3) + " % of Total Population in " + evt.graphic.attributes.Origin + " - " + evt.graphic.attributes.OriginEN + "</li><ul>");
          }
          
          map.graphics.add(highlightGraphic); 
        }); 
        
      });
      
    });   
  }

});

  

      
