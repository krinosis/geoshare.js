var geoshare = function (DOM, author_data) {
    // Global data
    // The id of the div that contain the workspace.
    // var geo_id = DOM.id.split('-')[1];
    var geo_id = DOM.id + '-geoshare';

    var obj_list = {};

    // The switch for collaboration feature
    var emitable = false;

    /************************   GLOBAL VARIABLES & SETTING UP   *************/    
    // Initial drawing settings
    var author_w = (author_data != null && author_data.w != null) ? parseInt(author_data.w) : 6;
    var author_h = (author_data != null && author_data.h != null) ? parseInt(author_data.h) : 6;
    var text_font = (author_data != null && author_data.text_font != null) ? author_data.text_font : "15px verdana";
    var browser = detect_browser();     // User browser

    // Creating canvas
    var canvas = document.createElement("canvas");
    canvas.id = DOM.id + '-canvas';
    var context = canvas.getContext("2d");

    // Calculate canvas attributes
    var division = 10;
    var interval = 5 * division;
    canvas.height = author_h * interval;
    canvas.width = author_w * interval;
    DOM.appendChild(canvas);

    DOM.appendChild(document.createElement("br"));

    // Drawing Buttons
    var line_btn = add_button(DOM, 'src/core/img/line.png', 'Solid Line', 'top');
    var dash_btn = add_button(DOM, 'src/core/img/dash.png', 'Dashed Line', 'top');
    var circle_btn = add_button(DOM, 'src/core/img/circle.png', 'Circle', 'top');
    var cross_point_btn = add_button(DOM, 'src/core/img/cross.png', 'Crossed Point', 'top');
    var dot_point_btn = add_button(DOM, 'src/core/img/dot.png', 'Dotted Point', 'top');
    var label_btn = add_button(DOM, 'src/core/img/label.png', 'Text Label', 'top');
    var height_btn = add_button(DOM, 'src/core/img/height.png', 'Height', 'top');

    DOM.appendChild(document.createElement("br"));

    var compass_btn = add_button(DOM, 'src/core/img/compass.png', 'Compass', 'top');
    var protractor_btn = add_button(DOM, 'src/core/img/protr_label.png', 'Protractor', 'bottom');
    var ruler_btn = add_button(DOM, 'src/core/img/ruler.png', 'Ruler', 'bottom');
    var select_btn = add_button(DOM, 'src/core/img/select.png', 'Select', 'top');
    var del_btn = add_button(DOM, 'src/core/img/del-passive.png', 'Delete', 'top');
    var copy_btn = add_button(DOM, 'src/core/img/copy-passive.png', 'Copy', 'top');

    DOM.appendChild(document.createElement("br"));

    // Tool Buttons
    var undo_btn = add_button(DOM, 'src/core/img/undo-passive.png', 'Undo', 'left');
    var redo_btn = add_button(DOM, 'src/core/img/redo-passive.png', 'Redo', 'left');

    var reset_option_values = ['none' , 'solid_lines', 'dashed_lines', 'circles', 'cross_points', 'dot_points'   , 'compass', 'labels', 'ruler', 'protractor', 'all'];  // To be added in future
    var reset_option_htmls =  ['Clear', 'Solid Lines', 'Dashed Lines', 'Circles', 'Cross Points', 'Dotted Points', 'Compass', 'Labels', 'Ruler', 'Protractor', 'All'];  // To be added in future
    var reset = add_options(DOM, reset_option_values, reset_option_htmls);

    // Color picker only works on Chrome
    if (browser == 'chrome' || browser == 'firefox') {
        var color_picker = document.createElement('input');
        color_picker.type = 'color';
        color_picker.style.margin = '5px';
        color_picker.style.width = '17px';
        DOM.appendChild(color_picker);

        // Color picker
        color_picker.onchange = function() {
            color = color_picker.value;
        }
    }

    // Textbox
    var textbox = document.createElement("input");
    DOM.appendChild(textbox);
    textbox.style.display = "none";
    textbox.style.zIndex = "99999";

    // Images
    var img_protractor = document.createElement("img");
    img_protractor.src = "src/core/img/protractor.png";
    var img_ruler = document.createElement("img");
    img_ruler.src = "src/core/img/ruler-" + (Math.max(author_w, author_h) - 1) + ".png";

    // Global variables
    var color = 'black';                // Color
    var DASH_PATTERN = [3, 3];          // Dash pattern
    var x1 = y1 = x2 = y2 = null;       // Drawing lines temporary variables
    var ox = oy = r = r2 = r3 = null;   // Drawing compasses
    var seg = 5;                        // The distance between 2 x in curve drawing
    var undo_stack = [];                // The undo stack
    var redo_stack = [];                // The redo stack
    var SNAP_POINT_THRES = division;    // Threshold for snapping
    var SNAP_EDGE_THRES = division * 6; // Threshold for snapping edges of ruler and protractor
    var ruler_action = null;            // Ruler action
    var protr_action = null;            // Protractor action
    var select_action = null;           // Select action
    var moving_transition = null;       // The current moving transaction
    var modify = false;                 // Modify status
    var COMPASS_LENGTH = Math.max(canvas.height, canvas.width) / 2;
    
    // User drawing locks & variables
    var locks = {};
    remove_lock([]);
    var user = {};
    var author = {};
    var user_redo = {};

    // Set the image of the undo-redo buttons:
    if (undo_stack.length != 0) {
        undo_btn.firstChild.src = 'src/core/img/undo-active.png';
    }

    /************************   ~GLOBAL VARIABLES & SETTING UP  *************/


    /************************   OPERATION METHODS   **************************/
    
    // Initialize the question geometry
    function init() {
        context.font = text_font;
        
        // Draw the borders
        draw_solid_line(0, 0, 0, canvas.height, 'blue');
        draw_solid_line(0, 0, canvas.width, 0, 'blue');
        draw_solid_line(0, canvas.height, canvas.width, canvas.height, 'blue');
        draw_solid_line(canvas.width, 0, canvas.width, canvas.height, 'blue');

        context.lineWidth = 0.5;

        //Setup listeners for events
        canvas.addEventListener("mousedown", mouse_down_handler, false);
        canvas.addEventListener("mousemove", mouse_move_handler, false);
        canvas.addEventListener("mouseup", mouse_up_handler, false);
    }

    // Cross point button
    cross_point_btn.onmousedown = function() {
        set_btn_onclick(this, ['cross'], '<i>INSTRUCTIONS</i><br><br>Locate point > CLICK');
    }

    // Cross point button
    dot_point_btn.onmousedown = function() {
        set_btn_onclick(this, ['dot'], '<i>INSTRUCTIONS</i><br><br>Locate point > CLICK');
    }

    // Label button
    label_btn.onmousedown = function() {
        set_btn_onclick(this, ['label'], '<i>INSTRUCTIONS</i><br><br>Locate label > CLICK<br>TYPE > <i>Enter</i>');
    }

    // Height button
    height_btn.onmousedown = function() {
        set_btn_onclick(this, ['height'], '<i>INSTRUCTIONS</i><br><br>PRESS > DRAG > RELEASE');
    }

    // Solid line button
    line_btn.onmousedown = function() {
        set_btn_onclick(this, ['solid_line'], '<i>INSTRUCTIONS</i><br><br>PRESS > DRAG > RELEASE');
    }

    // Dashed line button
    dash_btn.onmousedown = function() {
        set_btn_onclick(this, ['dashed_line'], '<i>INSTRUCTIONS</i><br><br>PRESS > DRAG > RELEASE');
    }

    // Circle button
    circle_btn.onmousedown = function() {
        set_btn_onclick(this, ['circle'], '<i>INSTRUCTIONS</i><br><br>Locate center<br>PRESS > DRAG > RELEASE');
    }

    // Compass button
    compass_btn.onmousedown = function() {
        set_btn_onclick(this, ['compass'], '<i>INSTRUCTIONS</i><br><br>Locate center > CLICK > RELEASE<br>MOVE for radius<br>PRESS > DRAG > RELEASE');
    }

    // Ruler button
    ruler_btn.onmousedown = function() {
        set_btn_onclick(this, ['ruler'], '<i>INSTRUCTIONS</i><br><br>Locate position > CLICK<br>Locate angle > CLICK');
    }

    // Protractor button
    protractor_btn.onmousedown = function() {
        set_btn_onclick(this, ['protr'], '<i>INSTRUCTIONS</i><br><br>Locate position > CLICK<br>Locate angle > CLICK');
    }

    // Undo button
    undo_btn.onmousedown = function() {
        user['select'] = [];
        if (undo_stack.length > 0) {
            _jump_trans = false;
            if (redo_stack.length == 0 || redo_stack[redo_stack.length - 1] != 'trans') {
                var _jump_trans = true;
            }

            var item_name = undo_stack.pop();
            redo_stack.push(item_name);
            var item = user[item_name].pop();
            user_redo[item_name].push(item);

            // Additional step to undo transition. Need to jump to the next transition.
            if (item_name == 'trans') {
                if (_jump_trans) {
                    var item_name = undo_stack.pop();
                    redo_stack.push(item_name);
                    var item = user[item_name].pop();
                    user_redo[item_name].push(item);
                }
                restore_transition(item, 0, 0, []);
            }
            else if (item_name == 'del') {
                restore_transition(item, 0, 0, []);
            }
            // else {
            //     if (socket != null) {
            //         for (var key in obj_list[item_name]) {
            //             if (obj_list[item_name].hasOwnProperty(key)) {
            //                 if (arrays_equal(item, obj_list[item_name][key])) {
            //                     prepare_emit_action('r', item_name, [key]);
            //                 }
            //             }
            //         }
            //     }
            // }

            restore_canvas();
            if (emitable) {
                emit_data();
            }
            redo_btn.firstChild.src = 'src/core/img/redo-active.png';
        }
        if (undo_stack.length == 0) {
            undo_btn.firstChild.src = 'src/core/img/undo-passive.png';
        }
        modify = true;
    }

    // Redo button
    redo_btn.onmousedown = function() {
        user['select'] = [];
        if (redo_stack.length > 0) {
            _jump_trans = false;
            if (undo_stack.length == 0 || undo_stack[undo_stack.length - 1] != 'trans') {
                var _jump_trans = true;
            }
            var item_name = redo_stack.pop();
            undo_stack.push(item_name);
            var item = user_redo[item_name].pop();
            user[item_name].push(item);

            // Additional step to undo transition. Need to jump to the next transition.
            if (item_name == 'trans') {
                if (_jump_trans) {
                    var item_name = redo_stack.pop();
                    undo_stack.push(item_name);
                    var item = user_redo[item_name].pop();
                    user[item_name].push(item);
                }
                restore_transition(item, 0, 0, []);
            }
            else if (item_name == 'del') {
                restore_transition(item, null, null, null);
            }

            restore_canvas();
            if (emitable) {
                emit_data();
            }
            undo_btn.firstChild.src = 'src/core/img/undo-active.png';
        }
        if (redo_stack.length == 0) {
            redo_btn.firstChild.src = 'src/core/img/redo-passive.png';
        }
        modify = true;
    }

    // Reset
    reset.onchange = function() {
        if (this.options[this.selectedIndex].value == 'all') {
            var prompt = confirm('Are you sure you want to reset everything?');
            if (prompt) {
                reset_user_data({});
                // if (socket != null)
                //     prepare_emit_action('c');
            }
        }
        else {
            reset_user_partial_data(this.options[this.selectedIndex].value);
        }

        reset_btn_classname();
        this.selectedIndex = 0;
        remove_lock([]);
        restore_canvas();
        if (emitable) {
            emit_data();
        }
        if (undo_stack.length == 0) {
            undo_btn.firstChild.src = 'src/core/img/undo-passive.png';
        }
        modify = true;
    }

    // Select button
    select_btn.onmousedown = function() {
        set_btn_onclick(this, ['select'], '<i>INSTRUCTIONS</i><br><br>DRAG TO SELECT');
    }

    // Del button/ Delete button
    del_btn.onmousedown = function() {
        if (moving_transition != null) {
            restore_transition(moving_transition, null, null, null);
            this.firstChild.src = 'src/core/img/del-passive.png';
            copy_btn.firstChild.src = 'src/core/img/copy-passive.png';

            user['del'].push(moving_transition);
            undo_stack.push('del');
            user['select'] = [];
            canvas.style.cursor = 'default';
            remove_lock([]);
            reset_btn_classname();
            restore_canvas();
        }
    }

    // Copy button
    copy_btn.onmousedown = function() {
        if (moving_transition != null) {
            copy_transition(moving_transition, user['select']);

            del_btn.firstChild.src = 'src/core/img/del-passive.png';
            this.firstChild.src = 'src/core/img/copy-passive.png';
            user['select'] = [];
            canvas.style.cursor = 'default';
            remove_lock([]);
            reset_btn_classname();
            restore_canvas();
        }
    }

    // Control event flow when pressing the mouse
    mouse_down_handler = function (event) {
        event.preventDefault();

        // If plot cross point is enabled
        if (!locks['cross']) {
            cross_down(event);
        }

        // If plot dotted point is enabled
        if (!locks['dot']) {
            dot_down(event);
        }

        // If sketch line is enabled
        if (!locks['solid_line']) {
            solid_down(event);
        }

        // If dashed line is enabled
        if (!locks['dashed_line']) {
            dashed_down(event);
        }

        // If drawing height is enabled
        if (!locks['height']) {
            height_down(event);
        }

        // If draw circle is enabled
        if (!locks['circle']) {
            circle_down(event);
        }

        // If setting ruler is enabled
        if (!locks['ruler']) {
            ruler_down(event);
        }

        // If setting compass is enabled
        if (!locks['compass']) {
            compass_down(event);
        }

        // If setting protractor is enabled
        if (!locks['protr']) {
            protr_down(event);
        }

        // If labeling is enabled
        if (!locks['label']) {
            label_down(event);
        }

        // If selecting is enabled
        if (!locks['select']) {
            select_down(event);
        }

        // Emit data through socket
        if (emitable) {
            emit_data();
        }
    }

    //Control event flow when moving the mouse
    mouse_move_handler = function (event) {
        event.preventDefault();

        // If sketch line is enabled
        if (!locks['solid_line_move']) {
            solid_move(event);
        }

        // If sketch line is enabled
        if (!locks['dashed_line_move']) {
            dashed_move(event);
        }

        // If drawing line is enabled
        if (!locks['height_move']) {
            height_move(event);
        }

        // If draw circle is still enabled
        if (!locks['circle']) {
            circle_move(event);
        }

        // If moving ruler is enabled
        if (!locks['ruler']) {
            ruler_move(event);
        }

        // If moving protractor is enabled
        if (!locks['protr']) {
            protr_move(event);
        }

        // If compass is enabled
        if (!locks['compass'] && locks['compass_rad'] && locks['compass_draw']) {
            compass_move(event);
        }

        // If setting compass radius is enabled
        if (!locks['compass_rad']) {
            compass_radius(event);
        }

        // If drawing compass is enabled
        if (!locks['compass_draw']) {
            compass_draw(event);
        }

        // If moving selecting is enabled
        if (!locks['select']) {
            select_move(event);
        }
    }

    //Control event flow when releasing the mouse
    mouse_up_handler = function (event) {
        event.preventDefault();

        // If sketch line was enabled
        if (!locks['solid_line']) {
            solid_up(event);
        }

        // If sketch dashed line was enabled
        if (!locks['dashed_line']) {
            dashed_up(event);
        }

        // If draw line was enabled
        if (!locks['height']) {
            height_up(event);
        }

        // If drawing circle was still enabled
        if (!locks['circle']) {
            circle_up(event);
        }

        // If setting compass was still enabled
        if (!locks['compass']) {
            compass_up(event);
        }

        // If ruler was enabled
        if (!locks['ruler']) {
            ruler_up(event);
        }

        // If ruler was enabled
        if (!locks['protr']) {
            protr_up(event);
        }

        // If moving selecting was enabled
        if (!locks['select']) {
            select_up(event);
        }

        // Emit data through socket
        if (emitable) {
            emit_data();
        }
    }

    // Helper function to add button
    function add_button(dom, url, name, placement) {
        var btn = document.createElement('button');
        btn.id = dom.id + '-' + name.replace(' ', '-');
        btn.className = 'geo2d-btn';
        var img = document.createElement('img');
        img.src = url;
        btn.appendChild(img);
        dom.appendChild(btn);
        return btn;
    }

    // Adding options to select dom
    function add_options(dom, option_values, options_htmls) {
        var select = document.createElement('select');
        select.style.width = '109px';
        select.style.margin = '5px';
        dom.appendChild(select);

        for (var i = 0; i < option_values.length; i++) {
            var op = document.createElement('option');
            op.value = option_values[i];
            op.innerHTML = options_htmls[i];
            select.appendChild(op);
        }

        return select;
    }

    // Set up button
    function set_btn_onclick(btn, types, tip) {
        if (btn.className != 'geo2d-btn') {
            btn.className = 'geo2d-btn';
            remove_lock([]);    // Lock all
            if ($.inArray('ruler', types) > -1) user['ruler'] = [];
            if ($.inArray('protr', types) > -1) user['protr'] = [];
        }
        else {
            reset_btn_classname();
            btn.className = 'geo2d-btn-onclick';
            if (types != null) remove_lock(types);
        }

        user['select'] = [];
        canvas.style.cursor = 'default';
        restore_canvas();
    }

    // Clear button classname
    function reset_btn_classname() {
        var elements = (document.getElementsByClassName('geo2d-btn-onclick'));
        for (var i = 0; i < elements.length; i++) {
            elements[i].className = 'geo2d-btn';
        }
    }

    // Helper function to get object size
    Object.size = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    // Emit data through socket
    function emit_data() {
        switch (caller) {
            case 'group':
                if (group_type == '0') {
                    socket.emit(
                        'free-group-client-data',
                        JSON.stringify({'ws_id':geo_id,'delta':JSON.stringify(data_binding())})
                    );
                }
                else {
                    socket.emit(
                        'assigned-group-client-data',
                        JSON.stringify({'g':g,'w':w,'q':q,'ws_id':geo_id,'delta':JSON.stringify(data_binding())})
                    );
                }
            break;

            case 'practice':
                socket.emit(
                    'practice-client-data',
                    JSON.stringify({'ws_id':geo_id,'data':JSON.stringify(data_binding())})
                );
            break;

            case 'whiteboard':
                socket.emit(
                    'whiteboard-client-data',
                    JSON.stringify({'ws_id':geo_id,'data':JSON.stringify(data_binding())})
                );
            break;

            default:
        }
    }

    /************************   ~OPERATION METHODS  **************************/


    /************************   WORKFLOW    **********************************/
    restore();

    /************************   ~WORKFLOW   **********************************/


    /************************   RETURN METHODS  *****************************/
    return {
        status: function() {
            return JSON.stringify(data_binding());
        },
        modified: function() {
            return isModified();
        },
        restore: function(data) {
            if (data != '') {
                store_data(data);
                restore_canvas();
            }
        },
        node_pull: function(data) {
            // obj_list = data;
            // restore_from_node();
            console.log(data);
            // store_data(data);
            // restore_canvas();
        },
        node_pull_delta: function(delta) {
            merge_delta(delta);
        },
        switch_emitable: function(status) {
            emitable = status;
        },
        getType: function() {
            return 'geo2d';
        },
        getID: function() {
            return ws_id;
        },
        debug: function() {
            // console.log(user_data);
            // console.log(author);
        }
    };

    /************************   ~RETURN METHODS *****************************/
}