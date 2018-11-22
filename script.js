var HEIGHT = 4; // Anzahl der Layer
var WIDTH = 4;  // Breite
var LENGTH = 4; // laenge der LEDs, in der UI vertikal

var frames = [];
var curr_frame = 0;

var play_interval = null;


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

function mouseenter_event(event, element) {
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
        display_pixel(parseInt(led_indecies[0]), parseInt(led_indecies[1]), parseInt(led_indecies[2]));
    }

}

function empty_frame() {
    var frame = [];
    for (var i = 0; i < HEIGHT; i++) {
        var layer = [];
        for (var j = 0; j < WIDTH; j++) {
            var colum = [];
            for (var k = 0; k < LENGTH; k++) {
                colum.push({'r': false, 'g': false, 'b': false});
            }
            layer.push(colum)
        }
        frame.push(layer)
    }
    return frame;
}

function add_frame() {
    frames.splice(curr_frame + 1, 0, empty_frame());
    next_frame();
    //display_frame();
    //frames.push(frame);
}

function delete_frame() {
    frames.splice(curr_frame, 1);
    if (curr_frame == frames.length) curr_frame = frames.length - 1;
    display_frame();
}

function display_pixel(i, j, k) {
    var led_id = "led" + i.toString() + j + k;
    document.getElementById(led_id).style = "color:#" + (frames[curr_frame][i][j][k]["r"] ? "FF" : "00") + (frames[curr_frame][i][j][k]["g"] ? "FF" : "00") + (frames[curr_frame][i][j][k]["b"] ? "FF" : "00") + ";";
}

function display_frame() {
    for (var i = 0; i < HEIGHT; i++) {
        for (var j = 0; j < WIDTH; j++) {
            for (var k = 0; k < LENGTH; k++) {
                display_pixel(i, j, k);
            }
        }
    }
    document.getElementById("frame_counter").innerHTML = (curr_frame + 1).toString() + "/" + frames.length;
}

function next_frame() {
    if ((curr_frame + 1) >= frames.length) {
        if (document.getElementById("loop_checkbox").checked) {
            curr_frame = 0;
        }
    } else {
        curr_frame += 1;
    }
    display_frame();
}

function prev_frame() {
    if (curr_frame == 0) {
        if (document.getElementById("loop_checkbox").checked) {
            curr_frame = frames.length - 1;
        }
    } else {
        curr_frame -= 1;
    }
    display_frame();
}

function play_pause() {
    if (play_interval === null) {
        play_interval = setInterval(next_frame, document.getElementById("delay_spinner").value);
        document.getElementById("play_pause_button").value = "Pause";
    } else {
        clearInterval(play_interval);
        play_interval = null;
        document.getElementById("play_pause_button").value = "Play";
    }
}

function byte_to_boolarray(input_number) {
    var result = [];
    for (var i = 0; i < 8; i++) {
        result.push(input_number % 2 == 1);
        input_number = Math.floor(input_number / 2);
    }
    result.reverse();
    return result;
}

function open_file(file_list) {
    var fr = new FileReader();
    fr.onloadend = function () {
        var result = this.result;
        const BYTES_PER_FRAME = (LENGTH * HEIGHT * WIDTH * 3 / 8);
        if (this.result.length % BYTES_PER_FRAME == 0) {
            var colors = "rgb".split("");
            var frame_count = this.result.length / BYTES_PER_FRAME;
            var new_frames = [];
            for (var frame_number = 0; frame_number < frame_count; frame_number++) {
                var frame_data = [];
                var frame = empty_frame();
                for (var i = 0; i < BYTES_PER_FRAME; i++) {
                    frame_data = frame_data.concat(byte_to_boolarray(result.charCodeAt(frame_number * BYTES_PER_FRAME + i)));
                }
                for (var i = 0; i < HEIGHT; i++) { //Layer
                    for (var color_index in colors) {
                        var color = colors[color_index];
                        for (var j = 0; j < WIDTH; j++) {
                            for (var k = 0; k < LENGTH; k++) {
                                frame[i][j][k][color] = frame_data[i * 3 * 4 * 4 + color_index * 16 + j * 4 + k];
                            }
                        }
                    }
                }
                new_frames.push(frame);

                //console.log(byte_to_boolarray(result.charCodeAt(frame_number)));
            }
            frames = new_frames;
            curr_frame = 0;
            display_frame();
        } else {
            alert("Datei hat die falsche Laenge");
        }
    };
    fr.readAsBinaryString(file_list[0]);
}

create_table();
add_frame();

