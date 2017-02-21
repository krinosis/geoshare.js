//  Detect browser
function detect_browser() {
    var val = navigator.userAgent.toLowerCase();
    if (val.indexOf("chrome") > -1) return "chrome";
    else if (val.indexOf("firefox") > -1) return "firefox";
    else if (val.indexOf("opera") > -1) return "opera";
    else if (val.indexOf("msie") > -1) return "ie";
    else if (val.indexOf("safari") > -1) return "safari";
}

// Textbox settings
function config_textbox(_x, _y) {
    // console.log(_x,_y);
    textbox.style.display = 'inline';
    textbox.value = '';
    textbox.style.width = '65px';
    textbox.style.height = '20px';
    textbox.style.position = 'absolute';
    textbox.style.top = (event.pageY-20) + "px";
    textbox.style.left = event.pageX + "px";
    textbox.focus();
}

// Draw point text fields
function display_textbox(_x, _y, _action) {
    config_textbox(_x, _y);
    
    textbox.onkeypress = function (event) {
        if (event.keyCode == 13) {
            textbox.style.display = "none";
            switch (_action) {
                case 'label':
                    write_label(_x, _y, textbox.value, color);
                    user['labels'].push([_x, _y, textbox.value, color]);
                    // if (socket != null)
                    //     prepare_emit_action('u', 'labels', [_x, _y, textbox.value, color]);

                    // Map the label to the base of a nearby height
                    map_to_nearest_height(_x, _y, textbox.value);
                    break;

                default:
            }
        }
        if (emitable) {
            emit_data();
        }
    }
}

// Write label to look exact as textbox
function write_label(_x, _y, text, _color) {
    context.fillStyle = _color;
    context.fillText(text, _x + 2, _y - 2);
}

// Prepare emit action
function prepare_emit_action(action_type, obj_type, array) {
    var action = {};

    if (action_type == 'c') {
        action.c = '1';
        obj_list = {};
    }
    else if (action_type == 'rt') {
        action.rt = obj_type;
    }
    else if (action_type == 'r') {
        action.r = [obj_type, array];
    }
    else {
        if (obj_list[obj_type] == null)
            obj_list[obj_type] = {};
        var rand_id = make_id(5);
        obj_list[obj_type][rand_id] = array;
        action[action_type] = [obj_type, rand_id, array];
    }

    geo2d_emit_data(action);
}

function geo2d_emit_data(action) {
    socket.emit('client-data', 
        JSON.stringify({'caller':caller,'c':c,'w':w,'q':q,'wo':wb_owner,'ws_id':geo_id,'delta':action}));
}

// To strip the remvoed data before sending
function strip_removed(_data) {
    for (var i = 0; i < _data.length; i++) {
        if (_data[i].indexOf(-1) > -1) {
            _data.splice(i--, 1);
        }
    }
    return _data;
}

// To check whether the ws is modified
function isModified() {
    return modify;
}

function make_id(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function arrays_equal(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}