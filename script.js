var current_config = {
    "h": 4, "w": 4, "l": 4, "cob": "bgr"
};

try {
    var supplied_config = window.location.hash.substr(1).split(",");
    for (var option in supplied_config) {
        var splitted_option = supplied_config[option].split(":");
        if (splitted_option[0] in current_config) {
            current_config[splitted_option[0]] = splitted_option[1];
        }
    }
} catch { }

const HEIGHT = parseInt(current_config["h"]); // Anzahl der Layer
const WIDTH = parseInt(current_config["w"]);  // Breite
const LENGTH = parseInt(current_config["l"]); // laenge der LEDs, in der UI vertikal

var frames = [];
var curr_frame = 0;

var play_interval = null;

const COLOR_ORDER_BINARY = current_config["cob"];
const COLOR_QUANTITY = COLOR_ORDER_BINARY.length;
const BITS_PER_FRAME = (LENGTH * HEIGHT * WIDTH * COLOR_QUANTITY);
const BYTES_PER_FRAME = (BITS_PER_FRAME / 8);



// Hilfefunktionen zum Umwandeln von Datentypen usw
// =================================================


// erzeugt einen komplett unabhaenigen Klon des Objektes
// Wird beim Frame kopieren benutzt
function deep_clone(obj) {

    return JSON.parse(JSON.stringify(obj));
}

// Wandelt eine Zahl (byte, also 0<=x<=255) in einen 8-er Array mit Boolschen Werten
function byte_to_boolarray(input_number) {
    var result = [];
    for (var i = 0; i < 8; i++) {
        result.push(input_number % 2 == 1);
        input_number = Math.floor(input_number / 2);
    }
    result.reverse();
    return result;
}


// Wandelt ein 8-er Array, basierend auf den Wahrheitswerten darin in eine Zahl um
function boolarray_to_bytes(boolarray) {
    if (boolarray.length % 8 == 0) {
        //thanks to https://blog.logrocket.com/binary-data-in-the-browser-untangling-an-encoding-mess-with-javascript-typed-arrays-119673c0f1fe
        // for solving this #C2 shit with an Uint8Array :D
        var bytes = new Uint8Array(boolarray.length / 8);
        for (var i = 0; i < boolarray.length; i += 8) {
            var byte_value = 0;
            for (var j = 0; j < 8; j++) {
                if (boolarray[i + j]) {
                    var exp = 7 - j;
                    byte_value += Math.pow(2, exp);
                }
            }
            bytes[i / 8] = byte_value;
        }
        return bytes
    } else {
        alert("Interner Fehler, boolarray hat falsche Laenge!!!");
        return "";
    }
}


// Input Handler (Buttons und Events)
// ==================================

// Nimmt die Mouse Events entgegen und ruft die passenden Funktionen auf
function mouseenter_event(event, element) {
    switch (event.buttons) {
        case 1: // linksklick
            handle_mouseevent("left", element);
            break;
        case 2: // rechtsklick
            handle_mouseevent("right", element);
            break;
        case 3: // beide
            handle_mouseevent("left", element);
            handle_mouseevent("right", element);
            break;
    }
}

// veraendert die Pixel aufgrund eines Mouseklicks
function handle_mouseevent(button, element) {
    var colors = [];
    for (var i in "rgb") {
        if (document.getElementById("checkbox_" + button + "_" + "rgb"[i]).checked) colors.push("rgb"[i]);
    }
    var action = document.getElementById("radiobox_" + button + "_fill").checked;
    var led_indecies = element.split("");
    for (var color in colors) {
        frames[curr_frame][parseInt(led_indecies[0])][parseInt(led_indecies[1])][parseInt(led_indecies[2])][colors[color]] = action;
    }
    //console.log(element);
    display_pixel(parseInt(led_indecies[0]), parseInt(led_indecies[1]), parseInt(led_indecies[2]));
}

// fuegt einen leeren Frame ein
function add_frame() {
    frames.splice(curr_frame + 1, 0, empty_frame());
    next_frame();
    //display_frame();
    //frames.push(frame);
}

// loescht einen Frame
function delete_frame() {
    if (frames.length == 1) {
        frames = [];
        add_frame();
    } else {
        frames.splice(curr_frame, 1);
        if (curr_frame == frames.length) curr_frame = frames.length - 1;
    }
    display_frame();
}

// kopiert einen Frame
function copy_frame() {
    frames.splice(curr_frame + 1, 0, deep_clone(frames[curr_frame]));
    next_frame();
}

// zeigt den naechsten Frame an
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

// zeigt den vorherigen Frame an
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

// startet und stoppt die Animation
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

// oeffnet eine Datei, parst sie und zeigt sie an
function open_file(file_list) {
    var fr = new FileReader();
    fr.onloadend = function () {
        var result = this.result;

        if (this.result.length % BYTES_PER_FRAME == 0) {
            var colors = COLOR_ORDER_BINARY.split("");
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
                                frame[i][j][k][color] = frame_data[calculate_bit_position(i,j,k,0,color_index)];
                            }
                        }
                    }
                }
                new_frames.push(frame);
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

function bit_array_of_current_data() {
    var colors = COLOR_ORDER_BINARY.split("");
    var frame_count = frames.length;
    var data = [];

    for (var frame_number = 0; frame_number < frame_count; frame_number++) {
        for (var i = 0; i < HEIGHT; i++) { //Layer
            for (var color_index in colors) {
                var color = colors[color_index];
                for (var j = 0; j < WIDTH; j++) {
                    for (var k = 0; k < LENGTH; k++) {
                        data[calculate_bit_position(i,j,k,frame_number,color_index)] = frames[frame_number][i][j][k][color];
                    }
                }
            }
        }
    }
    return data;
}

// speichert die aktuellen Daten in eine Datei
function save_file() {
    var data_string = boolarray_to_bytes(bit_array_of_current_data());
    var a = document.getElementById("download_link_hidden");
    var blob = new Blob([data_string]);
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = document.getElementById("filename_input").value + ".c4b";
    a.click();
    window.URL.revokeObjectURL(url);
}

// Zum Umschalten der Color buttons
function toogle_color_control(color_char, button) {
    document.getElementById("checkbox_" + button + "_" + color_char).checked = !document.getElementById("checkbox_" + button + "_" + color_char).checked
}


// Funktionen fuer interne Aufgaben
// ================================


function create_leds() {

    var led_ui_html = "<table class='leds'>\n";

    for (var i = 0; i < WIDTH; i++) {
        led_ui_html += "<tr>";
        for (var j = 0; j < HEIGHT; j++) {
            for (var k = 0; k < LENGTH; k++) {
                var led_id = j.toString() + i + k;
                led_ui_html += "<td id='led" + led_id + "' onmouseenter='mouseenter_event(event,\"" + led_id + "\")' onmousedown='mouseenter_event(event,\"" + led_id + "\")' class='led-ui-element'></td>";
            }
            if (j + 1 < HEIGHT)
                led_ui_html += "<td class='placeholder'> </td>";
        }
        led_ui_html += "</tr>";
    }

    led_ui_html += "</table>";

    document.getElementById("led_ui").innerHTML = led_ui_html;
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

function display_pixel(i, j, k) {
    var led_id = "led" + i.toString() + j + k;
    document.getElementById(led_id).style = "background-color:#" + (frames[curr_frame][i][j][k]["r"] ? "FF" : "00") + (frames[curr_frame][i][j][k]["g"] ? "FF" : "00") + (frames[curr_frame][i][j][k]["b"] ? "FF" : "00") + ";";
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

// Behandelt die Shortcuts und ruft die passenden Funktionen auf
window.onkeyup = function (e) {
    if (e.target.tagName == "INPUT") return;

    switch (e.key) {
        case "ArrowLeft": //pfeil links
            prev_frame();
            break;
        case "ArrowRight": // pfeil rechts
            next_frame();
            break;
        case "a": // a
            add_frame();
            break;
        case "d": // d
            delete_frame();
            break;
        case "c": // c
            copy_frame();
            break;
        case " ": // spacebar
            play_pause();
            break;
        case "r": // r
            toogle_color_control("r", "left");
            break;
        case "g": // g
            toogle_color_control("g", "left");
            break;
        case "b": // b
            toogle_color_control("b", "left");
            break;
        case "w": // w
            for (var i in "rgb")
                document.getElementById("checkbox_left_" + "rgb"[i]).checked = true;
            break;
        case "f": // f
            if (document.getElementById("radiobox_left_fill").checked) {
                document.getElementById("radiobox_left_empty").checked = true;
            } else {
                document.getElementById("radiobox_left_fill").checked = true;
            }
            break;
        case "R": // r
            toogle_color_control("r", "right");
            break;
        case "G": // g
            toogle_color_control("g", "right");
            break;
        case "B": // b
            toogle_color_control("b", "right");
            break;
        case "W": // w
            for (var i in "rgb")
                document.getElementById("checkbox_right_" + "rgb"[i]).checked = true;
            break;
        case "F": // f
            if (document.getElementById("radiobox_right_fill").checked) {
                document.getElementById("radiobox_right_empty").checked = true;
            } else {
                document.getElementById("radiobox_right_fill").checked = true;
            }
            break;


    }

    //console.log(e);

};

function calculate_bit_position(i, j, k, frame_number, color_index) {

    return frame_number * BITS_PER_FRAME   +   i * COLOR_QUANTITY * WIDTH * LENGTH   +   color_index * WIDTH * LENGTH   +   j * LENGTH   +   k ;
}

create_leds();
add_frame();





