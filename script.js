
var HEIGHT = 4; // Anzahl der Layer
var WIDTH = 4;  // Breite
var LENGTH = 4; // laenge der LEDs, in der UI vertikal

var frames = [];
var curr_frame = 0;


function create_table() {

    var led_ui_html = "<table>\n";

    for (var i = 0; i < WIDTH; i++) {
        led_ui_html += "<tr>";
        for (var j = 0; j < HEIGHT; j++) {
            for (var k = 0; k < LENGTH; k++) {
                var led_id = j.toString() + i + k;
                led_ui_html += "<td id='led" + led_id + "' onmouseenter='mouseenter_event(event,\"" + led_id + "\")' onmousedown='mouseenter_event(event,\"" + led_id + "\")' class='led-ui-element'>&#x25cf;</td>";
            }
            led_ui_html += "<td> </td>";
        }
        led_ui_html += "</tr>";
    }

    led_ui_html += "</table>";

    document.getElementById("led_ui").innerHTML = led_ui_html;
}

function mouseenter_event(event,element) {
    if (event.buttons == 1) {
        var e = document.getElementById("color_control");
        var colors = e.options[e.selectedIndex].value.split("");
        var e = document.getElementById("action_control");
        var action = (e.options[e.selectedIndex].value === "FF");
        var led_indecies = element.split("");
        for (var color in colors) {
            frames[curr_frame][parseInt(led_indecies[0])][parseInt(led_indecies[1])][parseInt(led_indecies[2])][colors[color]] = action;
        }
        console.log(element);
        display_pixel(parseInt(led_indecies[0]),parseInt(led_indecies[1]),parseInt(led_indecies[2]));
    }

}

function add_frame() {
    var frame = [];
    for (var i = 0; i<HEIGHT; i++) {
        var layer = [];
        for (var j = 0; j<WIDTH ; j++) {
            var colum = [];
            for (var k = 0; k<LENGTH; k++) {
                colum.push({'r':false,'g':false,'b':false});
            }
            layer.push(colum)
        }
        frame.push(layer)
    }
    frames.push(frame);
}

function display_pixel(i,j,k) {
    var led_id = "led" + i.toString()+j+k;
    document.getElementById(led_id).style = "color:#" + (frames[curr_frame][i][j][k]["r"] ? "FF" : "00") + (frames[curr_frame][i][j][k]["g"] ? "FF" : "00") + (frames[curr_frame][i][j][k]["b"] ? "FF" : "00") + ";";
}

function display_frame() {
    for (var i = 0; i<HEIGHT; i++) {
        for (var j = 0; j<WIDTH ; j++) {
            for (var k = 0; k<LENGTH; k++) {
                display_pixel(i,j,k);
            }
        }
    }

}

create_table();
add_frame();
display_frame();