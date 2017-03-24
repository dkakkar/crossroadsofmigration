$('#playbutton').click(function (){
      
      console.log(state)
      if(state=='stop'){
        state='play';
        //var button = $("#playbutton").classed('btn-success', true); 
        //button.select("i").attr('class', "glyphicon glyphicon-pause");  
        $("#playbutton i").attr('class', "glyphicon glyphicon-play");        
        
      }
      else if(state=='play' || state=='resume'){
        state = 'pause';
        $("#playbutton i").attr('class', "glyphicon glyphicon-play"); 
      }
      else if(state=='pause'){
        state = 'resume';
        $("#playbutton i").attr('class', "glyphicon glyphicon-pause");
        
        var i = 2005, howManyTimes = 8;
        function f() {
            var timeExtent = new esri.TimeExtent();
            console.log( i );
            i++;
            timeExtent.startTime = new Date("01/01/" + i + "UTC");
            timeExtent.endTime = new Date("12/31/" + i + " UTC");
            featureLayer.setTimeDefinition(timeExtent);
            
            if( i < 2013){
              setTimeout( f, 1500 );
            }
            /*else{
              state = 'play';
              $("#playbutton i").attr('class', "glyphicon glyphicon-stop");
              //return;
            }*/
        }
    
        f();
        
      }
      //console.log("button play pressed, play was " + state);
      $("#playbutton").button('refresh');
    });
////

$('#playbutton').click(function (){      
        var i = 2005, howManyTimes = 8;
        function f() {
            var timeExtent = new esri.TimeExtent();
            console.log( i );
            i++;
            timeExtent.startTime = new Date("01/01/" + i + "UTC");
            timeExtent.endTime = new Date("12/31/" + i + " UTC");
            featureLayer.setTimeDefinition(timeExtent);
            
            if( i < 2013){
              setTimeout( f, 1500 );
            }
            /*else{
              state = 'play';
              $("#playbutton i").attr('class', "glyphicon glyphicon-stop");
              //return;
            }*/
        }    
        f();             
    });

    // http://jsfiddle.net/amcharts/ZPqhP/
    // http://stackoverflow.com/questions/9856084/jquery-play-pause-jquery-function