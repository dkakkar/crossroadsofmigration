
var values = [];

$(document).ready(function() {
    // let's generate the data for 50 slides
    generateData();
   
});

function generateData () {
    for (var i = 0; i < 50; i++) {
        var row = {
            year: 2013 - 50 + i
        
        };
        
        values.push(row);
    }
}

// initialize slider
var currentSlide = 0;
var playInterval;
var slideDuration = 1000; // in milliseconds
var autoRewind = true;
$(function() {
    $( "#slider" ).slider({
        value: 0,
        min: 0,
        max: 7,
        step: 1,
        slide: function( event, ui ) {
            setSlide(ui.value);
        }
    });
    
    $( "#play" ).button({
      icons: {
        primary: "ui-icon-play"
      },
      text: false
    }).click(function () {
        if (playInterval != undefined) {
            clearInterval(playInterval);
            playInterval = undefined;
            $(this).button({
                icons: {
                    primary: "ui-icon-play"
                }
            });
            return;
        }
        $(this).button({
            icons: {
                primary: "ui-icon-pause"
            }
        });
        playInterval = setInterval(function () {
            currentSlide++;
            if (currentSlide > values.length) {
                if (autoRewind) {
                    currentSlide = 0;
                }
                else {
                    clearIntveral(playInterval);
                    return;
                }
            }
            setSlide(currentSlide);
        }, slideDuration);
    });
});

function setSlide (index) {
    currentSlide = index;
    map.dataProvider.areas = values[index].areas;
    map.dataProvider.images[0].label = values[index].year;
    map.validateData();
    $( "#slider" ).slider( "value", index );
}