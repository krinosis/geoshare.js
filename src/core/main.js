var geoshare = function (DOM, author_data, user_data) {
    // Global data
    // The id of the div that contain the workspace.
    // var workspace_id = DOM.id.split('-')[1];
    var id_splits = DOM.id.split('-');
    var ws_id = id_splits[1]+'-'+id_splits[2];
    var mode = (data != null && data.mode != null) ? data.mode : null;

    if (mode == AUTHORING_DEFAULT_MODE) {

    } else if (mode == AUTHORING_SOLUTION_MODE) {

    } else if (mode == STUDENT_WORKING_MODE) {

    } else if (mode == STUDENT_SOLUTION_MODE) {

    } else {
        console.log('Input Mode of Workspace not defined');
    }

    workspace_id = DOM.id.split('-')[1];
    var obj_list = {};

    // The switch for collaboration feature
    var emitable = false;

    /************************   GLOBAL VARIABLES & SETTING UP   *************/    
    // author_data = JSON.parse(author_data);

    var author_w = parseInt(author_data.w);
    var author_h = parseInt(author_data.h);

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

    // Initial drawing settings
    var text_font = (author_data.text_font != null) ? author_data.text_font : "15px verdana";
    var browser = detect_browser();     // User browser

    DOM.appendChild(document.createElement("br"));

    // Drawing Buttons
    var line_btn = add_button(DOM, '/css/images/geo2d/line.png', 'Solid Line', 'top');
    var dash_btn = add_button(DOM, '/css/images/geo2d/dash.png', 'Dashed Line', 'top');
    var circle_btn = add_button(DOM, '/css/images/geo2d/circle.png', 'Circle', 'top');
    var cross_point_btn = add_button(DOM, '/css/images/geo2d/cross.png', 'Crossed Point', 'top');
    var dot_point_btn = add_button(DOM, '/css/images/geo2d/dot.png', 'Dotted Point', 'top');
    var label_btn = add_button(DOM, '/css/images/geo2d/label.png', 'Text Label', 'top');
    var height_btn = add_button(DOM, '/css/images/geo2d/height.png', 'Height', 'top');

    DOM.appendChild(document.createElement("br"));

    var compass_btn = add_button(DOM, '/css/images/geo2d/compass.png', 'Compass', 'top');
    var protractor_btn = add_button(DOM, '/css/images/geo2d/protr_label.png', 'Protractor', 'bottom');
    var ruler_btn = add_button(DOM, '/css/images/geo2d/ruler.png', 'Ruler', 'bottom');
    var select_btn = add_button(DOM, '/css/images/geo2d/select.png', 'Select', 'top');
    var del_btn = add_button(DOM, '/css/images/geo2d/del-passive.png', 'Delete', 'top');
    var copy_btn = add_button(DOM, '/css/images/geo2d/copy-passive.png', 'Copy', 'top');

    DOM.appendChild(document.createElement("br"));

    // Tool Buttons
    var undo_btn = add_button(DOM, '/css/images/geo2d/undo-passive.png', 'Undo', 'left');
    var redo_btn = add_button(DOM, '/css/images/geo2d/redo-passive.png', 'Redo', 'left');

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
    img_protractor.src = "/css/images/geo2d/protractor.png";
    var img_ruler = document.createElement("img");
    img_ruler.src = "/css/images/geo2d/ruler-" + (Math.max(author_w, author_h) - 1) + ".png";

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

    // If this is in authoring, author_data will be user object, which is modifiable
    if (caller == 'create' || caller == 'update') {
        reset_user_data(author_data);
    }

    // If this is in classroom, author_data will be author object, which is not modifiable. However, the student can create and modify his user object data
    else {
        reset_user_data(user_data);
        set_author_data(author_data);
    }

    // Restoration student data
    if (user_data != null && user_data != "") {
        store_data(user_data);
    }

    // Set the image of the undo-redo buttons:
    if (undo_stack.length != 0) {
        undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
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
        current_canvas_id = this.id.split('-')[1];
    }

    // Cross point button
    dot_point_btn.onmousedown = function() {
        set_btn_onclick(this, ['dot'], '<i>INSTRUCTIONS</i><br><br>Locate point > CLICK');
        current_canvas_id = this.id.split('-')[1];
    }

    // Label button
    label_btn.onmousedown = function() {
        set_btn_onclick(this, ['label'], '<i>INSTRUCTIONS</i><br><br>Locate label > CLICK<br>TYPE > <i>Enter</i>');
        current_canvas_id = this.id.split('-')[1];
    }

    // Height button
    height_btn.onmousedown = function() {
        set_btn_onclick(this, ['height'], '<i>INSTRUCTIONS</i><br><br>PRESS > DRAG > RELEASE');
        current_canvas_id = this.id.split('-')[1];
    }

    // Solid line button
    line_btn.onmousedown = function() {
        set_btn_onclick(this, ['solid_line'], '<i>INSTRUCTIONS</i><br><br>PRESS > DRAG > RELEASE');
        current_canvas_id = this.id.split('-')[1];
    }

    // Dashed line button
    dash_btn.onmousedown = function() {
        set_btn_onclick(this, ['dashed_line'], '<i>INSTRUCTIONS</i><br><br>PRESS > DRAG > RELEASE');
        current_canvas_id = this.id.split('-')[1];
    }

    // Circle button
    circle_btn.onmousedown = function() {
        set_btn_onclick(this, ['circle'], '<i>INSTRUCTIONS</i><br><br>Locate center<br>PRESS > DRAG > RELEASE');
        current_canvas_id = this.id.split('-')[1];
    }

    // Compass button
    compass_btn.onmousedown = function() {
        set_btn_onclick(this, ['compass'], '<i>INSTRUCTIONS</i><br><br>Locate center > CLICK > RELEASE<br>MOVE for radius<br>PRESS > DRAG > RELEASE');
        current_canvas_id = this.id.split('-')[1];
    }

    // Ruler button
    ruler_btn.onmousedown = function() {
        set_btn_onclick(this, ['ruler'], '<i>INSTRUCTIONS</i><br><br>Locate position > CLICK<br>Locate angle > CLICK');
        current_canvas_id = this.id.split('-')[1];
    }

    // Protractor button
    protractor_btn.onmousedown = function() {
        set_btn_onclick(this, ['protr'], '<i>INSTRUCTIONS</i><br><br>Locate position > CLICK<br>Locate angle > CLICK');
        current_canvas_id = this.id.split('-')[1];
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
            redo_btn.firstChild.src = '/css/images/geo2d/redo-active.png';
        }
        if (undo_stack.length == 0) {
            undo_btn.firstChild.src = '/css/images/geo2d/undo-passive.png';
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
            undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
        }
        if (redo_stack.length == 0) {
            redo_btn.firstChild.src = '/css/images/geo2d/redo-passive.png';
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
        remove_tooltip(DOM.id + '-canvas');
        this.selectedIndex = 0;
        remove_lock([]);
        restore_canvas();
        if (emitable) {
            emit_data();
        }
        if (undo_stack.length == 0) {
            undo_btn.firstChild.src = '/css/images/geo2d/undo-passive.png';
        }
        modify = true;
    }

    // Select button
    select_btn.onmousedown = function() {
        set_btn_onclick(this, ['select'], '<i>INSTRUCTIONS</i><br><br>DRAG TO SELECT');
        current_canvas_id = this.id.split('-')[1];
    }

    // Del button/ Delete button
    del_btn.onmousedown = function() {
        if (moving_transition != null) {
            current_canvas_id = this.id.split('-')[1];
            restore_transition(moving_transition, null, null, null);
            this.firstChild.src = '/css/images/geo2d/del-passive.png';
            copy_btn.firstChild.src = '/css/images/geo2d/copy-passive.png';

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
            current_canvas_id = this.id.split('-')[1];
            copy_transition(moving_transition, user['select']);

            del_btn.firstChild.src = '/css/images/geo2d/del-passive.png';
            this.firstChild.src = '/css/images/geo2d/copy-passive.png';
            user['select'] = [];
            canvas.style.cursor = 'default';
            remove_lock([]);
            reset_btn_classname();
            restore_canvas();
        }
    }

    // Control event flow when pressing the mouse
    mouse_down_handler = function (event) {
        if (workspace_id == current_canvas_id || caller == 'create' || caller == 'update') {
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
    }

    //Control event flow when moving the mouse
    mouse_move_handler = function (event) {
        if (workspace_id == current_canvas_id || caller == 'create' || caller == 'update') {
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
    }

    //Control event flow when releasing the mouse
    mouse_up_handler = function (event) {
        if (workspace_id == current_canvas_id || caller == 'create' || caller == 'update') {
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
    }

    // Cross point down / cross down
    function cross_down(event) {
        var _x = positionX();
        var _y = positionY();
        plot_point_cross(_x, _y, color);
        user['cross_points'].push([_x, _y, color]);
        undo_stack.push('cross_points');
        modify = true;
        undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
        reset_redo();

        // if (socket != null) prepare_emit_action('u', 'cross_points', [_x, _y, color]);
    }

    // Dot point down / dot down
    function dot_down(event) {
        var _x = positionX();
        var _y = positionY();
        plot_point_circle(_x, _y, color);
        user['dot_points'].push([_x, _y, color]);
        undo_stack.push('dot_points');
        modify = true;
        undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
        reset_redo();

        // if (socket != null) prepare_emit_action('u', 'dot_points', [_x, _y, color]);
    }

    // Label down
    function label_down(event) {
        var _x = positionX();
        var _y = positionY();
        display_textbox(_x, _y, 'label');
        undo_stack.push('labels');
        modify = true;
        undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
        reset_redo();
    }

    // Solid line down / solid down
    function solid_down(event) {
        x1 = positionX();
        y1 = positionY();
        var _snap = get_snap_point(x1, y1);
        if (_snap != null) {
            x1 = _snap[0];
            y1 = _snap[1];
        }
        locks['solid_line_move'] = false;
    }

    // Solid line move / solid move
    function solid_move(event) {
        restore_canvas();
        
        // Interactive on every move
        x2 = positionX();
        y2 = positionY();
        var _snap = get_snap_point(x2, y2);
        if (_snap != null) {
            x2 = _snap[0];
            y2 = _snap[1];
            highlight_point(_snap[0], _snap[1], SNAP_POINT_THRES);
        }
        draw_solid_line(x1, y1, x2, y2, color);

        // Gabriel: uncomment this line to set the index on the line
        // context.fillText((length_line(x1, y1, x2, y2) / interval).toFixed(2), x2 + 5, y2 - 5);

        // Emit data on mouse move
        user['solid_lines'].push([x1, y1, x2, y2, color]);
        if (emitable) {
            emit_data();
        }
        user['solid_lines'].pop();
    }

    // Solid line up / solid up
    function solid_up(event) {
        restore_canvas();

        locks['solid_line_move'] = true;
        x2 = positionX();
        y2 = positionY();
        var _snap = get_snap_point(x2, y2);
        if (_snap != null) {
            x2 = _snap[0];
            y2 = _snap[1];
        }
        if (length_line(x1, y1, x2, y2) > SNAP_POINT_THRES) {
            draw_solid_line(x1, y1, x2, y2, color);
            user['solid_lines'].push([x1, y1, x2, y2, color]);
            undo_stack.push('solid_lines');
            modify = true;
            undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
            reset_redo();

            // if (socket != null) prepare_emit_action('u', 'solid_lines', [x1, y1, x2, y2, color]);
        }

        // Gabriel: Blinking the text
        context.fillText((length_line(x1, y1, x2, y2) / interval).toFixed(2), x2 + 5, y2 - 5);
        setTimeout(
            function() {
                restore_canvas()
            },
            1000
        );

        x1 = y1 = x2 = y2 = null;
    }

    // Dashed line down / dash down
    function dashed_down(event) {
        x1 = positionX();
        y1 = positionY();
        var _snap = get_snap_point(x1, y1);
        if (_snap != null) {
            x1 = _snap[0];
            y1 = _snap[1];
        }
        locks['dashed_line_move'] = false;
    }

    // Dashed line move / dash move
    function dashed_move(event) {
        restore_canvas();
        
        // Interactive on every move
        x2 = positionX();
        y2 = positionY();
        var _snap = get_snap_point(x2, y2);
        if (_snap != null) {
            x2 = _snap[0];
            y2 = _snap[1];
            highlight_point(_snap[0], _snap[1], SNAP_POINT_THRES);
        }
        draw_dashed_line(x1, y1, x2, y2, color);

        // Emit data on mouse move
        user['dashed_lines'].push([x1, y1, x2, y2, color]);
        if (emitable) {
            emit_data();
        }
        user['dashed_lines'].pop();
    }

    // Dashed line up / dash up
    function dashed_up(event) {
        restore_canvas();

        locks['dashed_line_move'] = true;
        x2 = positionX();
        y2 = positionY();
        var _snap = get_snap_point(x2, y2);
        if (_snap != null) {
            x2 = _snap[0];
            y2 = _snap[1];
        }
        if (length_line(x1, y1, x2, y2) > SNAP_POINT_THRES) {
            draw_dashed_line(x1, y1, x2, y2, color);
            user['dashed_lines'].push([x1, y1, x2, y2, color]);
            undo_stack.push('dashed_lines');
            modify = true;
            undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
            reset_redo();

            // if (socket != null) prepare_emit_action('u', 'dashed_lines', [x1, y1, x2, y2, color]);
        }
        x1 = y1 = x2 = y2 = null;
    }

    // Height down
    function height_down(event) {
        x1 = positionX();
        y1 = positionY();
        var _snap = get_snap_point(x1, y1);
        if (_snap != null) {
            x1 = _snap[0];
            y1 = _snap[1];
        }
        locks['height_move'] = false;
        // highlight_heights(x1, y1);
    }

    // Height move
    function height_move(event) {
        if (!locks['height_move']) {
            restore_canvas();
            
            // Interactive on every move
            x2 = positionX();
            y2 = positionY();
            var _snap = get_snap_point_height(x1, y1, x2, y2);
            if (_snap != null) {
                x2 = _snap[0];
                y2 = _snap[1];
                draw_dashed_line(_snap[0], _snap[1], _snap[5], _snap[6], color);
            }
            draw_solid_line(x1, y1, x2, y2, color);

            // Emit data on mouse move
            user['heights'].push([x1, y1, x2, y2, null, null, null, null, null, null, null, null, null, null, null, null, color]);
            if (emitable) {
                emit_data();
            }
            user['heights'].pop();
            highlight_heights(x1, y1, x2, y2);
        }
    }

    // Height up
    function height_up(event) {
        restore_canvas();

        locks['height_move'] = true;
        x2 = positionX();
        y2 = positionY();
        var _snap = get_snap_point_height(x1, y1, x2, y2);
        if (_snap != null) {
            x2 = _snap[0];
            y2 = _snap[1];
            draw_solid_line(x1, y1, x2, y2, color);

            // Drawing the small right angle square box
            var _x3 = _snap[2];
            var _y3 = _snap[3];
            var _len1 = length_line(_x3, _y3, x2, y2);
            var _len2 = length_line(x1, y1, x2, y2);
            var _square_len = 5;

            if (x1 != x2) {
                var _m = (y1 - y2) / (x1 - x2);
                var _x_small_1 = (_square_len / Math.sqrt(1 + _m*_m)) * ((x1 - x2) / Math.abs(x2 - x1)) + x2;
                var _y_small_1 = _m * (_x_small_1 - x2) + y2;
            }
            else {
                var _x_small_1 = x2;
                var _y_small_1 = y2 - (_square_len) * ((y2 - y1) / Math.abs(y2 - y1));
            }           
            
            if (_x3 != x2) {
                var _m = (_y3 - y2) / (_x3 - x2);
                var _x_small_2 = (_square_len / Math.sqrt(1 + _m*_m)) * ((_x3 - x2) / Math.abs(x2 - _x3)) + x2;
                var _y_small_2 = _m * (_x_small_2 - x2) + y2;
            }
            else {
                var _x_small_2 = x2;
                var _y_small_2 = y2 - (_square_len) * ((y2 - _y3) / Math.abs(y2 - _y3));
            }

            var _x_small_mid = (_x_small_1 + _x_small_2) / 2;
            var _y_small_mid = (_y_small_1 + _y_small_2) / 2;
            var _x_small_opp = 2 * _x_small_mid - x2;
            var _y_small_opp = 2 * _y_small_mid - y2;

            draw_solid_line(_x_small_1, _y_small_1, _x_small_opp, _y_small_opp);
            draw_solid_line(_x_small_2, _y_small_2, _x_small_opp, _y_small_opp);
            
            _top_point = get_nearest_point_name(x1, y1);
            var _top_name = (_top_point != null) ? _top_point[3] : '';
            var _top_distance = (_top_point != null) ? 0 : null;
            user['heights'].push([x1, y1, 
                parseFloat(x2.toFixed(4)), parseFloat(y2.toFixed(4)), 
                parseFloat(_x_small_1.toFixed(4)), parseFloat(_y_small_1.toFixed(4)), 
                parseFloat(_x_small_2.toFixed(4)), parseFloat(_y_small_2.toFixed(4)), 
                parseFloat(_x_small_opp.toFixed(4)), parseFloat(_y_small_opp.toFixed(4)), 
                _top_point, '', _top_distance, null, _snap[7], _snap[8], color]);
            undo_stack.push('heights');

            // if (socket != null)
            //     prepare_emit_action('u', 'heights', [x1, y1, 
            //     parseFloat(x2.toFixed(4)), parseFloat(y2.toFixed(4)), 
            //     parseFloat(_x_small_1.toFixed(4)), parseFloat(_y_small_1.toFixed(4)), 
            //     parseFloat(_x_small_2.toFixed(4)), parseFloat(_y_small_2.toFixed(4)), 
            //     parseFloat(_x_small_opp.toFixed(4)), parseFloat(_y_small_opp.toFixed(4)), 
            //     _top_point, '', _top_distance, null, _snap[7], _snap[8], color]);

            // Draw extra path if the height base falls outside the line
            if (_snap[4]) {
                draw_dashed_line(_snap[0], _snap[1], _snap[5], _snap[6], color);
                user['dashed_lines'].push([_snap[0], _snap[1], _snap[5], _snap[6], color]);
                modify = true;
                undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
                reset_redo();
                // if (socket != null)
                //     prepare_emit_action('u', 'dashed_lines', [_snap[0], _snap[1], _snap[5], _snap[6], color]);
            }
        }
        x1 = y1 = x2 = y2 = null;
    }

    // Circle down
    function circle_down(event) {
        x1 = positionX();
        y1 = positionY();
        var _snap = get_snap_point(x1, y1);
        if (_snap != null) {
            x1 = _snap[0];
            y1 = _snap[1];
        }
        plot_point_circle(x1, y1, color);
        locks['circle_move'] = false;
    }

    // Circle move
    function circle_move(event) {
        if (!locks['circle_move']) {
            restore_canvas();
            
            // Interactive on every move
            x2 = positionX();
            y2 = positionY();
            plot_point_circle(x1, y1, color);
            draw_arc(x1, y1, length_line(x1, y1, x2, y2), 0, 2 * Math.PI, false, color);

            // Emit data on mouse move
            user['circles'].push([parseFloat(x1.toFixed(2)), parseFloat(y1.toFixed(2)), parseFloat(length_line(x1, y1, x2, y2).toFixed(2)), color]);
            if (emitable) {
                emit_data();
            }
            user['circles'].pop();
        }
    }

    // Circle up
    function circle_up(event) {
        restore_canvas();
        
        // Interactive on every move
        x2 = positionX();
        y2 = positionY();
        locks['circle_move'] = true;
        if (Math.abs(y2 - y1) > 2 || Math.abs(x2 - x1) > 2) {
            plot_point_circle(x1, y1, color);
            draw_arc(x1, y1, length_line(x1, y1, x2, y2), 0, 2 * Math.PI, false, color);
            user['circles'].push(
                [parseFloat(x1.toFixed(2)), parseFloat(y1.toFixed(2)), parseFloat(length_line(x1, y1, x2, y2).toFixed(2)), color]);
            undo_stack.push('circles');

            // if (socket != null) prepare_emit_action('u', 'circles', 
            //     [parseFloat(x1.toFixed(2)), parseFloat(y1.toFixed(2)), parseFloat(length_line(x1, y1, x2, y2).toFixed(2)), color]);
        }
        else {
            alert('Press, hold & drag the mouse to draw circle');
        }
        x1 = y1 = x2 = y2 = null;
        modify = true;
        undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
        reset_redo();
    }

    // Compass down
    function compass_down(event) {
        if (locks['compass_draw'] && locks['compass_rad']) {
            restore_canvas();
            ox = positionX();
            oy = positionY();
            plot_point_circle(ox, oy, color);
        }
        else {
            if (!locks['compass_rad']) {
                locks['compass_rad'] = true;
                x1 = positionX();
                y1 = positionY();
                plot_point_circle(ox, oy, color);
                plot_point_circle(x1, y1, color);
                draw_dashed_line(ox, oy, x1, y1, color);
                user['compass'].push([color, [parseFloat(x1.toFixed(2)), parseFloat(y1.toFixed(2))]]);
                var _x = x1 - ox;
                var _y = y1 - oy;
                r3 = Math.sqrt(_x*_x + _y*_y);
                locks['compass_draw'] = false;
            }
        }
    }

    // Compass move
    function compass_move(event) {
        var _x1 = positionX();
        var _y1 = positionY();
        restore_canvas();
        plot_point_circle(_x1, _y1, color);

        if (ox != null) {
            plot_point_circle(ox, oy, color);
        }

        // Drawing the physical compass
        draw_compass(_x1, _y1, _x1, _y1);
    }

    // Compass radius
    function compass_radius(event) {
        x1 = positionX();
        y1 = positionY();
        restore_canvas();
        context.fillStyle = 'grey';
        plot_point_circle(ox, oy, color);
        plot_point_circle(x1, y1, color);
        draw_dashed_line(ox, oy, x1, y1, 'grey');
        context.fillText((length_line(ox, oy, x1, y1) / interval).toFixed(2), (ox + x1)/2, (oy + y1)/2);

        // Drawing the physical compass
        draw_compass(ox, oy, x1, y1);
    }

    // Compass draw
    function compass_draw(event) {
        restore_canvas();

        // Interactive on every move
        context.fillStyle = 'grey';
        x2 = positionX();
        y2 = positionY();
        plot_point_circle(ox, oy, color);

        if (Math.abs(x2 - x1) < 2 * interval && Math.abs(y2 - y1) < 2 * interval) {
            _snaps = get_circle_snap_points(x2, y2, ox, oy, r3);
            plot_point_circle(_snaps[0], _snaps[1], color);
            draw_solid_line(x1, y1, _snaps[0], _snaps[1], color);               
            draw_dashed_line(ox, oy, _snaps[0], _snaps[1], color);
            context.fillText((r3 / interval).toFixed(2), (ox + _snaps[0])/2, (oy + _snaps[1])/2);
            
            if (Math.abs(_snaps[0] - x1) >= seg || Math.abs(_snaps[1] - y1) >= seg) {
                x1 = _snaps[0];
                y1 = _snaps[1];
                user['compass'][user['compass'].length - 1].push([parseFloat(x1.toFixed(2)), parseFloat(y1.toFixed(2))]);
                if (emitable) {
                    emit_data();
                }
            }
        }
        else {
            draw_dashed_line(ox, oy, x2, y2, color);
            plot_point_circle(x2, y2, color);
        }

        // Drawing the physical compass
        draw_compass(ox, oy, x1, y1);
    }

    // Compass up
    function compass_up(event) {
        if (locks['compass_rad'] && locks['compass_draw']) {
            locks['compass_rad'] = false;
        }
        else {
            if (!locks['compass_draw']) {
                locks['compass_draw'] = true;
                _snaps = get_circle_snap_points(x2, y2, ox, oy, r3);
                user['compass'][user['compass'].length - 1].push([parseFloat(_snaps[0].toFixed(2)), parseFloat(_snaps[1].toFixed(2))]);

                ox = oy = x1 = y1 = x2 = y2 = r = r2 = r3 = null;
                undo_stack.push('compass');
                context.fillStyle = color;
            }
        }
        modify = true;
        undo_btn.firstChild.src = '/css/images/geo2d/undo-active.png';
        reset_redo();
    }

    // Ruler down
    function ruler_down(event) {
        ox = positionX();
        oy = positionY();

        // If no ruler set yet, set the first horizontal ruler
        if (user['ruler'].length == 0) {
            user['ruler'] = [ox, oy, ox + (author_w - 1) * interval + 10, oy];
            ox = oy = null;
        }
        // If the ruler already set, detect the actions: move or rotate
        else {
            if (ruler_action == null) {
                var _ruler_len = length_line(user['ruler'][0], user['ruler'][1], user['ruler'][2], user['ruler'][3]);
                // If ox, oy fall to the moving area
                if (length_line(ox, oy, user['ruler'][0], user['ruler'][1]) < _ruler_len / 4) {
                    ruler_action = 'left';
                }
                else if (length_line(ox, oy, user['ruler'][2], user['ruler'][3]) < _ruler_len / 4) {
                    ruler_action = 'right';
                }
                else {
                    ruler_action = 'move';
                }
            }
            else {
                ruler_action = null;
            }
        }
    }

    // Ruler move
    function ruler_move(event) {
        var _x0 = positionX();
        var _y0 = positionY();
        restore_canvas();

        // If there is no ruler yet
        if (user['ruler'].length == 0) {
            ruler_action = null;
            context.drawImage(img_ruler, _x0, _y0);

            user['ruler'] = [_x0, _y0, _x0 + (author_w - 1) * interval + 10, _y0];
            if (emitable) {
                emit_data();
            }
            user['ruler'] = [];
        }
        // If the ruler already existed, move mouse around to find the rotation points
        else {
            var _ruler_len = length_line(user['ruler'][0], user['ruler'][1], user['ruler'][2], user['ruler'][3]);
            // If the ruler is to be moved or rotated
            if (ruler_action != null) {
                // If rotate the left corner
                if (ruler_action == 'left') {
                    _snaps = get_circle_snap_points(
                        _x0, _y0, 
                        user['ruler'][2], 
                        user['ruler'][3], 
                        _ruler_len
                    );
                    user['ruler'][0] = _snaps[0];
                    user['ruler'][1] = _snaps[1];
                }

                // If rotate the right corner
                else if (ruler_action == 'right') {
                    _snaps = get_circle_snap_points(
                        _x0, _y0, 
                        user['ruler'][0], 
                        user['ruler'][1], 
                        _ruler_len
                    );
                    user['ruler'][2] = _snaps[0];
                    user['ruler'][3] = _snaps[1];
                }

                // If move the ruler
                else {
                    user['ruler'] = [
                        user['ruler'][0] += (_x0 - ox),
                        user['ruler'][1] += (_y0 - oy),
                        user['ruler'][2] += (_x0 - ox),
                        user['ruler'][3] += (_y0 - oy),
                    ];
                    ox = _x0;
                    oy = _y0; 
                }
                if (emitable) {
                    emit_data();
                }
                restore_canvas(); // Make the drawing precise
            }
            // If navigating to find the end points to move/ rotate the protractor
            else {
                if (length_line(_x0, _y0, user['ruler'][0], user['ruler'][1]) < (_ruler_len / 4)) {
                    canvas.style.cursor = 'alias';
                    highlight_point(user['ruler'][0], user['ruler'][1], _ruler_len / 4);
                }
                else if (length_line(_x0, _y0, user['ruler'][2], user['ruler'][3]) < (_ruler_len / 4)) {
                    canvas.style.cursor = 'alias';
                    highlight_point(user['ruler'][2], user['ruler'][3], _ruler_len / 4);
                }
                else {
                    canvas.style.cursor = 'move';
                }
            }
        }
    }

    // Ruler up
    function ruler_up(event) {
        ruler_action = null;
    }

    // Protractor down / Protr down
    function protr_down(event) {
        ox = positionX();
        oy = positionY();

        // If no protr set yet, set the first horizontal protr
        if (user['protr'].length == 0) {
            user['protr'] = [ox - 136, oy, ox + 136, oy];
            ox = oy = null;
        }
        // If the protr already set, detect the actions: move or rotate
        else {
            if (protr_action == null) {
                // If ox, oy fall to the moving area
                if (length_line(ox, oy, user['protr'][0], user['protr'][1]) < SNAP_EDGE_THRES) {
                    protr_action = 'left';
                }
                else if (length_line(ox, oy, user['protr'][2], user['protr'][3]) < SNAP_EDGE_THRES) {
                    protr_action = 'right';
                }
                else {
                    protr_action = 'move';
                }
            }
            else {
                protr_action = null;
            }
        }
    }

    // Protractor move / Protr move
    function protr_move(event) {
        var _x0 = positionX();
        var _y0 = positionY();
        restore_canvas();

        // If there is no protr yet
        if (user['protr'].length == 0) {
            protr_action = null;
            context.drawImage(img_protractor, _x0 - 136, _y0 - 137);

            user['protr'] = [_x0 - 136, _y0, _x0 + 136, _y0];
            if (emitable) {
                emit_data();
            }
            user['protr'] = [];
        }
        // If the protr already existed, move mouse around to find the rotation points
        else {
            // If the protr is to be moved or rotated
            if (protr_action != null) {
                // If rotate the left corner
                if (protr_action == 'left') {
                    _snaps = get_circle_snap_points(
                        _x0, _y0, 
                        (user['protr'][0] + user['protr'][2]) / 2, 
                        (user['protr'][1] + user['protr'][3]) / 2,
                        length_line(user['protr'][0], user['protr'][1], user['protr'][2], user['protr'][3]) / 2
                    );

                    user['protr'] = [
                        _snaps[0],
                        _snaps[1],
                        user['protr'][0] + user['protr'][2] - _snaps[0],
                        user['protr'][1] + user['protr'][3] - _snaps[1],
                    ]
                }

                // If rotate the right corner
                else if (protr_action == 'right') {
                    _snaps = get_circle_snap_points(
                        _x0, _y0, 
                        (user['protr'][0] + user['protr'][2]) / 2, 
                        (user['protr'][1] + user['protr'][3]) / 2,
                        length_line(user['protr'][0], user['protr'][1], user['protr'][2], user['protr'][3]) / 2
                    );

                    user['protr'] = [
                        user['protr'][0] + user['protr'][2] - _snaps[0],
                        user['protr'][1] + user['protr'][3] - _snaps[1],
                        _snaps[0],
                        _snaps[1],
                    ]
                }

                // If move the protr
                else {
                    user['protr'] = [
                        user['protr'][0] += (_x0 - ox),
                        user['protr'][1] += (_y0 - oy),
                        user['protr'][2] += (_x0 - ox),
                        user['protr'][3] += (_y0 - oy),
                    ];
                    ox = _x0;
                    oy = _y0; 
                }
                if (emitable) {
                    emit_data();
                }
                restore_canvas(); // Make the drawing precise
            }
            // If navigating to find the end points to move/ rotate the protractor
            else {
                if (length_line(_x0, _y0, user['protr'][0], user['protr'][1]) < SNAP_EDGE_THRES) {
                    canvas.style.cursor = 'alias';
                    highlight_point(user['protr'][0], user['protr'][1], SNAP_EDGE_THRES);
                }
                else if (length_line(_x0, _y0, user['protr'][2], user['protr'][3]) < SNAP_EDGE_THRES) {
                    canvas.style.cursor = 'alias';
                    highlight_point(user['protr'][2], user['protr'][3], SNAP_EDGE_THRES);
                }
                else {
                    canvas.style.cursor = 'move';
                }
            }
        }
    }

    // Protractor up / Protr up
    function protr_up(event) {
        protr_action = null;
    }

    // Select down
    function select_down(event) {
        if (locks['trans']) {
            // The very starting point, to draw the select box
            if (moving_transition == null) {
                x1 = positionX();
                y1 = positionY();
                locks['select_move'] = false;
                select_action = null;
            }
            else {
                locks['trans'] = false;
            }
        }
        // The start of transition drawing, decide action
        else {
            ox = positionX();
            oy = positionY();

            var _mid_x = (x1 + x2)/2;
            var _mid_y = (y1 + y2)/2;
            var _thres = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1))/5;
            moving_transition = highlight_selected(x1, y1, x2, y2);

            // If ox, oy fall to the moving area
            if (length_line(ox, oy, x1, y1) < _thres
                || length_line(ox, oy, x1, y2) < _thres
                || length_line(ox, oy, x2, y1) < _thres
                || length_line(ox, oy, x2, y2) < _thres) {
                select_action = 'rotate';
            }
            else if (length_line(ox, oy, _mid_x, y1) < _thres) {
                select_action = 'scale-top';
            }
            else if (length_line(ox, oy, _mid_x, y2) < _thres) {
                select_action = 'scale-down';
            }
            else if (length_line(ox, oy, x1, _mid_y) < _thres) {
                select_action = 'scale-left';
            }
            else if (length_line(ox, oy, x2, _mid_y) < _thres) {
                select_action = 'scale-right';
            }
            else if (x1 <= ox && ox <= x2 && y1 <= oy && oy <= y2) {
                select_action = 'move';
            }
            else {
                locks['trans'] = true;
                locks['select_move'] = true;
                x1 = x2 = y1 = y2 = null;
                moving_transition = null;
                user['select'] = [];
            }
        }
    }

    // Select move
    function select_move(event) {
        // Drawing the select box
        if (!locks['select_move']) {
            restore_canvas();

            // Interactive on every move
            x2 = positionX();
            y2 = positionY();
            user['select'] = [x1, y1, x2, y2];
            moving_transition = highlight_selected(x1, y1, x2, y2);

            // // Emit data on mouse move
            // user['solid_lines'].push([x1, y1, x2, y2, 'green']);
            // if (emitable) {
            //     emit_data();
            // }
            // user['solid_lines'].pop();
        }
        // Transition
        if (!locks['trans']) {
            restore_canvas();

            var _x = positionX();
            var _y = positionY();

            // Moving transition
            if (select_action != null) {
                if (select_action == 'rotate') {
                    var _center_x = (x1 + x2)/2;
                    var _center_y = (y1 + y2)/2;

                    var _rad_1 = Math.atan2(oy - _center_y, ox - _center_x);
                    var _rad_2 = Math.atan2(_y - _center_y, _x - _center_x);
                    var _rad = _rad_2 - _rad_1;

                    restore_transition(moving_transition, 0, 0, null, [_rad, _center_x, _center_y]);
                }
                else if (select_action == 'scale-left') {
                    highlight_selected(x1 + _x - ox, y1, x2 - (_x - ox), y2);
                    user['select'] = [x1 + _x - ox, y1, x2 - (_x - ox), y2];
                    restore_transition(moving_transition, _x - ox, 0, [(x1 + x2)/2, null, (x1 + x2)/2 - ox, null]);
                }
                else if (select_action == 'scale-right') {
                    highlight_selected(x1 - (_x - ox), y1, x2 + _x - ox, y2);
                    user['select'] = [x1 - (_x - ox), y1, x2 + _x - ox, y2];
                    restore_transition(moving_transition, -(_x - ox), 0, [(x1 + x2)/2, null, (x1 + x2)/2 - ox, null]);
                }
                else if (select_action == 'scale-top') {
                    highlight_selected(x1, y1 + _y - oy, x2, y2 - (_y - oy));
                    user['select'] = [x1, y1 + _y - oy, x2, y2 - (_y - oy)];
                    restore_transition(moving_transition, 0, _y - oy, [null, (y1 + y2)/2, null, (y1 + y2)/2 - oy]);
                }
                else if (select_action == 'scale-down') {
                    highlight_selected(x1, y1 - (_y - oy), x2, y2 + _y - oy);
                    user['select'] = [x1, y1 - (_y - oy), x2, y2 + _y - oy];
                    restore_transition(moving_transition, 0, -(_y - oy), [null, (y1 + y2)/2, null, (y1 + y2)/2 - oy]);
                }
                else if (select_action == 'move') {
                    highlight_selected(x1 + _x - ox, y1 + _y - oy, x2 + _x - ox, y2 + _y - oy);
                    user['select'] = [x1 + _x - ox, y1 + _y - oy, x2 + _x - ox, y2 + _y - oy];
                    restore_transition(moving_transition, _x - ox, _y - oy, []);
                }
            }
            // Detect action first
            else {
                var _thres = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1))/5;

                // Searching for the location of rotating
                if (length_line(_x, _y, x1, y1) < _thres) {
                    canvas.style.cursor = 'alias';
                    highlight_point(x1, y1, _thres);
                    tooltip(DOM.id + '-canvas', 'ROTATE<br><br>IMPORTANT: MOVE SLOWLY', 'right');
                }
                else if (length_line(_x, _y, x1, y2) < _thres) {
                    canvas.style.cursor = 'alias';
                    highlight_point(x1, y2, _thres);
                    tooltip(DOM.id + '-canvas', 'ROTATE<br><br>IMPORTANT: MOVE SLOWLY', 'right');
                }
                else if (length_line(_x, _y, x2, y1) < _thres) {
                    canvas.style.cursor = 'alias';
                    highlight_point(x2, y1, _thres);
                    tooltip(DOM.id + '-canvas', 'ROTATE<br><br>IMPORTANT: MOVE SLOWLY', 'right');
                }
                else if (length_line(_x, _y, x2, y2) < _thres) {
                    canvas.style.cursor = 'alias';
                    highlight_point(x2, y2, _thres);
                    tooltip(DOM.id + '-canvas', 'ROTATE<br><br>IMPORTANT: MOVE SLOWLY', 'right');
                }
                // Searching for the location of flipping
                else if (length_line(_x, _y, x1, (y1 + y2)/2) < _thres) {
                    canvas.style.cursor = 'e-resize';
                    highlight_point(x1, (y1 + y2)/2, _thres);
                    tooltip(DOM.id + '-canvas', 'SCALE', 'right');
                }
                else if (length_line(_x, _y, (x1 + x2)/2, y1) < _thres) {
                    canvas.style.cursor = 'n-resize';
                    highlight_point((x1 + x2)/2, y1, _thres);
                    tooltip(DOM.id + '-canvas', 'SCALE', 'right');
                }
                else if (length_line(_x, _y, x2, (y1 + y2)/2) < _thres) {
                    canvas.style.cursor = 'e-resize';
                    highlight_point(x2, (y1 + y2)/2, _thres);
                    tooltip(DOM.id + '-canvas', 'SCALE', 'right');
                }
                else if (length_line(_x, _y, (x1 + x2)/2, y2) < _thres) {
                    canvas.style.cursor = 'n-resize';
                    highlight_point((x1 + x2)/2, y2, _thres);
                    tooltip(DOM.id + '-canvas', 'SCALE', 'right');
                }
                // Searching for the location of dragging
                else if (x1 <= _x && _x <= x2 && y1 <= _y && _y <= y2) {
                    canvas.style.cursor = 'move';
                    tooltip(DOM.id + '-canvas', 'DRAG', 'right');
                }
                // Default
                else {
                    canvas.style.cursor = 'default';
                }
            }
        }
    }

    // Select up
    function select_up(event) {
        restore_canvas();

        x1 = Math.min(user['select'][0], user['select'][2]);
        y1 = Math.min(user['select'][1], user['select'][3]);
        x2 = Math.max(user['select'][0], user['select'][2]);
        y2 = Math.max(user['select'][1], user['select'][3]);

        if (!transition_data_not_empty(moving_transition)) {
            locks['del'] = locks['copy'] = false;
            del_btn.firstChild.src = '/css/images/geo2d/del-active.png';
            copy_btn.firstChild.src = '/css/images/geo2d/copy-active.png';
        }
        else {
            locks['del'] = locks['copy'] = true;
            del_btn.firstChild.src = '/css/images/geo2d/del-passive.png';
            copy_btn.firstChild.src = '/css/images/geo2d/copy-passive.png';
        }
        
        if (!locks['select_move']) {
            locks['select_move'] = true;
            locks['trans'] = false;
        }
        else {
            select_action = null;
            if (moving_transition != null) {
                // Only when starting to transition
                if (undo_stack.length != 0 && undo_stack[undo_stack.length - 1] != 'trans') {
                    user['trans'].push(moving_transition);
                    undo_stack.push('trans');
                }

                moving_transition = highlight_selected(x1, y1, x2, y2); // New moving transition
                user['trans'].push(moving_transition);
                undo_stack.push('trans');
            }
        }
    }

    // Draw the solid lines.
    function draw_solid_line(fromX, fromY, toX, toY, _color, _witdh) {
        context.strokeStyle = _color;
        if (_witdh != null) context.lineWidth = _witdh;
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.closePath();                
        context.stroke();
        context.lineWidth = 1;
    }

    //Draw the dashed lines. To be revised.
    function draw_dashed_line(fromX, fromY, toX, toY, _color) {
        context.beginPath();
        context.strokeStyle = _color;
        var dx = toX - fromX;
        var dy = toY - fromY;
        var angle = Math.atan2(dy, dx);
        var x = fromX;
        var y = fromY;
        context.moveTo(fromX, fromY);
        var idx = 0;
        var draw = true;

        while (!((dx < 0 ? x <= toX : x >= toX) && (dy < 0 ? y <= toY : y >= toY))) {
            var dashLength = DASH_PATTERN[idx++ % DASH_PATTERN.length];
            var nx = x + (Math.cos(angle) * dashLength);
            x = dx < 0 ? Math.max(toX, nx) : Math.min(toX, nx);
            var ny = y + (Math.sin(angle) * dashLength);
            y = dy < 0 ? Math.max(toY, ny) : Math.min(toY, ny);
            if (draw) {
                context.lineTo(x, y);
            } else {
                context.moveTo(x, y);
            }
            draw = !draw;
        }
        
        context.closePath();
        context.stroke();
    }

    // Plot cross point.
    function plot_point_cross(x, y, _color) {
        draw_solid_line(x - 3, y - 3, x + 3, y + 3, _color);
        draw_solid_line(x + 3, y - 3, x - 3, y + 3, _color);
    }

    // Plot the circle point.
    function plot_point_circle(x, y, _color) {
        context.strokeStyle = _color;
        context.beginPath();
        context.arc(x, y, 1, 0, 2 * Math.PI, true);
        context.stroke();
    }

    // Draw the arc.
    function draw_arc(x, y, radius, start, end, clockwise, _color) {
        context.strokeStyle = _color;
        context.beginPath();
        context.arc(x, y, radius, start, end, clockwise);
        context.stroke();
    }

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

    // Map the label to the nearest height
    function map_to_nearest_height(_x, _y, _text) {
        var _min = 50;//Math.min(canvas.height, canvas.width);
        var _min_index = -1;
        var _pos = null;
        for (var i = 0; i < user['heights'].length; i++) {
            if (length_line(user['heights'][i][0], user['heights'][i][1], _x, _y) < _min) {
                _min = length_line(user['heights'][i][2], user['heights'][i][3], _x, _y);
                _min_index = i;
                _pos = 'top'; // 10 is position of the top
            }
            if (length_line(user['heights'][i][2], user['heights'][i][3], _x, _y) < _min) {
                _min = length_line(user['heights'][i][2], user['heights'][i][3], _x, _y);
                _min_index = i;
                _pos = 'base'; // 11 is the position of the base
            }
        }
        if (_min_index != -1) {
            if (_pos == 'top') {
                if (user['heights'][_min_index][12] == null || _min < user['heights'][_min_index][12]) {
                    user['heights'][_min_index][12] = _min;
                    user['heights'][_min_index][10] = _text;
                }
            }
            else if (_pos == 'base'){
                if (user['heights'][_min_index][13] == null || _min < user['heights'][_min_index][13]) {
                    user['heights'][_min_index][13] = _min;
                    user['heights'][_min_index][11] = _text;
                }
            }
        }
    }

    // Write label to look exact as textbox
    function write_label(_x, _y, text, _color) {
        context.fillStyle = _color;
        context.fillText(text, _x + 2, _y - 2);
    }

    // Getting line length in pixels
    function length_line(_x1, _y1, _x2, _y2) {
        return Math.sqrt(Math.pow(_x2 - _x1, 2) + Math.pow(_y2 - _y1, 2));
    }

    // Get snap point
    function get_snap_point(_x, _y) {
        if (Object.size(author) == 0) {
            return get_snap_point_helper(_x, _y, user);
        }
        else {
            var snapped_points = get_snap_point_helper(_x, _y, user);
            if (snapped_points == null) {
                return get_snap_point_helper(_x, _y, author);
            }
            else {
                var temp = get_snap_point_helper(_x, _y, author);
                if (temp == null) {
                    return snapped_points;
                }
                else {
                    return temp;
                }
            }
        }
    }

    // Snap to circles
    function get_circle_snap_points(_x_curr, _y_curr, _x_ori, _y_ori, _r) {
        var _x2_snap, _y2_snap;

        // Snap to the nearest point on circle
        var _x = _x_curr - _x_ori;
        var _y = _y_curr - _y_ori;
        _r2 = Math.sqrt(_x*_x + _y*_y); // Find the bigger radius in pixel

        if (_x > 0) {
            _x2_snap = _x_ori + (_r/_r2) * Math.abs(_x);
        }
        else {
            _x2_snap = _x_ori - (_r/_r2) * Math.abs(_x);
        }

        if (_y > 0) {
            _y2_snap = _y_ori + (_r/_r2) * Math.abs(_y);
        }
        else {
            _y2_snap = _y_ori - (_r/_r2) * Math.abs(_y);
        }

        return [_x2_snap, _y2_snap];
    }

    // Helper function get snapped point based on user type
    function get_snap_point_helper(_x, _y, arr) {
        // Scan through points
        var _points = arr['cross_points'].concat(arr['dot_points']);
        for (var i = 0; i < _points.length; i++) {
            if (length_line(_x, _y, _points[i][0], _points[i][1]) < SNAP_POINT_THRES) {
                return _points[i];
            }
        }

        // Scan through circle centers
        var _circles = arr['circles'];
        for (var i = 0; i < _circles.length; i++) {
            if (length_line(_x, _y, _circles[i][0], _circles[i][1]) < SNAP_POINT_THRES) {
                return [_circles[i][0], _circles[i][1]];
            }
        }

        // Scan through lines
        var _lines = arr['solid_lines'].concat(arr['dashed_lines'], arr['heights']);
        for (var i = 0; i < _lines.length; i++) {
            if (length_line(_x, _y, _lines[i][0], _lines[i][1]) < SNAP_POINT_THRES) {
                return [_lines[i][0], _lines[i][1]];
            }
            if (length_line(_x, _y, _lines[i][2], _lines[i][3]) < SNAP_POINT_THRES) {
                return [_lines[i][2], _lines[i][3]];
            }
        }

        // Nothing snapped
        return null;
    }

    // Get snap point height
    function get_snap_point_height(_x, _y, _x2, _y2) {
        if (Object.size(author) == 0) {
            return get_snap_point_helper_height(_x, _y, user, _x2, _y2, 'user');
        }
        else {
            var snapped_points = get_snap_point_helper_height(_x, _y, user, _x2, _y2, 'user');
            if (snapped_points == null) {
                return get_snap_point_helper_height(_x, _y, author, _x2, _y2, 'author');
            }
            else {
                var temp = get_snap_point_helper_height(_x, _y, author, _x2, _y2, 'author');
                if (temp == null) {
                    return snapped_points;
                }
                else {
                    return temp;
                }
            }
        }
    }

    // Helper function get snapped point based on user type
    function get_snap_point_helper_height(_xA, _yA, arr, _x2, _y2, type) {
        // Only snap to author's heights, not snap to user's heights
        if (type == 'user') {
            _lines = arr['solid_lines'].concat(arr['dashed_lines']);
        }
        else {
            _lines = arr['solid_lines'].concat(arr['dashed_lines'], arr['heights']);
        }
        // Scan through height base points
        for (var i = 0; i < _lines.length; i++) {
            _xB = _lines[i][0];
            _yB = _lines[i][1];
            _xC = _lines[i][2];
            _yC = _lines[i][3];

            if (_yB == _yC) {
                _xH = _xA;
                _yH = _yB;
            }
            else if (_xB == _xC) {
                _xH = _xB;
                _yH = _yA;
            }
            else {
                var k = (_yC - _yB)/(_xC - _xB);
                var m = (_yB - k * _xB);
                var _xH = (_yA + _xA / k - m)/(k + 1/k);
                var _yH = k * (_yA + _xA/k - m) / (k + 1/k) + m;
            }

            if (length_line(_x2, _y2, _xH, _yH) < SNAP_POINT_THRES) {
                var extra = false;
                // To draw extra dashed line if the height base is outside the base line
                if (_xB < _xC) {
                    if (_xH < _xB) {
                        extra = true;
                    }
                    else if (_xH > _xC) {
                        extra = true;
                    }
                }
                else if (_xB > _xC) {
                    if (_xH > _xB) {
                        extra = true;
                    }
                    else if (_xH < _xC) {
                        extra = true;
                    }
                }
                else {
                    if (_yB < _yC && (_yC < _yH || _yB > _yH)) {
                        extra = true;
                    }
                    else if (_yB > _yC && (_yC > _yH || _yH > _yB)) {
                        extra = true;
                    }
                }

                if (length_line(_xB, _yB, _xH, _yH) > length_line(_xC, _yC, _xH, _yH)) {
                    return [_xH, _yH, _xB, _yB, extra, _xC, _yC, get_nearest_point_name(_xB, _yB), get_nearest_point_name(_xC, _yC)];
                }
                else {
                    return [_xH, _yH, _xC, _yC, extra, _xB, _yB, get_nearest_point_name(_xB, _yB), get_nearest_point_name(_xC, _yC)];
                }
            }
        }

        // Nothing snapped
        return null;
    }

    function highlight_medians(_x, _y) {
        if (Object.size(author['solid_lines']) != 0) {
            for (var i = 0; i < author['solid_lines'].length; i++) {
                _x1 = author['solid_lines'][i][0];
                _y1 = author['solid_lines'][i][1];
                _x2 = author['solid_lines'][i][2];
                _y2 = author['solid_lines'][i][3];
                highlight_point((_x1 + _x2)/2, (_y1 + _y2)/2, SNAP_POINT_THRES);
            }
        }
        if (Object.size(author['dashed_lines']) != 0) {
            for (var i = 0; i < author['dashed_lines'].length; i++) {
                _x1 = author['dashed_lines'][i][0];
                _y1 = author['dashed_lines'][i][1];
                _x2 = author['dashed_lines'][i][2];
                _y2 = author['dashed_lines'][i][3];
                highlight_point((_x1 + _x2)/2, (_y1 + _y2)/2, SNAP_POINT_THRES);
            }
        }
        if (Object.size(author['heights']) != 0) {
            for (var i = 0; i < author['heights'].length; i++) {
                _x1 = author['heights'][i][0];
                _y1 = author['heights'][i][1];
                _x2 = author['heights'][i][2];
                _y2 = author['heights'][i][3];
                highlight_point((_x1 + _x2)/2, (_y1 + _y2)/2, SNAP_POINT_THRES);
            }
        }
        for (var i = 0; i < user['solid_lines'].length; i++) {
            _x1 = user['solid_lines'][i][0];
            _y1 = user['solid_lines'][i][1];
            _x2 = user['solid_lines'][i][2];
            _y2 = user['solid_lines'][i][3];
            highlight_point((_x1 + _x2)/2, (_y1 + _y2)/2, SNAP_POINT_THRES);
        }
        for (var i = 0; i < user['dashed_lines'].length; i++) {
            _x1 = user['dashed_lines'][i][0];
            _y1 = user['dashed_lines'][i][1];
            _x2 = user['dashed_lines'][i][2];
            _y2 = user['dashed_lines'][i][3];
            highlight_point((_x1 + _x2)/2, (_y1 + _y2)/2, SNAP_POINT_THRES);
        }
        for (var i = 0; i < user['heights'].length; i++) {
            _x1 = user['heights'][i][0];
            _y1 = user['heights'][i][1];
            _x2 = user['heights'][i][2];
            _y2 = user['heights'][i][3];
            highlight_point((_x1 + _x2)/2, (_y1 + _y2)/2, SNAP_POINT_THRES);
        }
    }

    // Highlight height
    function highlight_heights(_xA, _yA, _x2, _y2) {
        var _xH_min, _yH_min;
        var _min_len = 50;//Math.min(canvas.height, canvas.width);

        if (Object.size(author['solid_lines']) != 0) {
            for (var i = 0; i < author['solid_lines'].length; i++) {
                _xB = author['solid_lines'][i][0];
                _yB = author['solid_lines'][i][1];
                _xC = author['solid_lines'][i][2];
                _yC = author['solid_lines'][i][3];

                var _H = get_height_base(_xA, _yA, _xB, _yB, _xC, _yC);
                if (length_line(_x2, _y2, _H[0], _H[1]) < _min_len) {
                    _xH_min = _H[0];
                    _yH_min = _H[1];
                    _min_len = length_line(_x2, _y2, _H[0], _H[1]);
                }
                // highlight_point(_H[0], _H[1], SNAP_POINT_THRES);
            }
        }
        if (Object.size(author['dashed_lines']) != 0) {
            for (var i = 0; i < author['dashed_lines'].length; i++) {
                _xB = author['dashed_lines'][i][0];
                _yB = author['dashed_lines'][i][1];
                _xC = author['dashed_lines'][i][2];
                _yC = author['dashed_lines'][i][3];

                var _H = get_height_base(_xA, _yA, _xB, _yB, _xC, _yC);
                if (length_line(_x2, _y2, _H[0], _H[1]) < _min_len) {
                    _xH_min = _H[0];
                    _yH_min = _H[1];
                    _min_len = length_line(_x2, _y2, _H[0], _H[1]);
                }
                // highlight_point(_H[0], _H[1], SNAP_POINT_THRES);
            }
        }
        if (Object.size(author['heights']) != 0) {
            for (var i = 0; i < author['heights'].length; i++) {
                _xB = author['heights'][i][0];
                _yB = author['heights'][i][1];
                _xC = author['heights'][i][2];
                _yC = author['heights'][i][3];

                var _H = get_height_base(_xA, _yA, _xB, _yB, _xC, _yC);
                if (length_line(_x2, _y2, _H[0], _H[1]) < _min_len) {
                    _xH_min = _H[0];
                    _yH_min = _H[1];
                    _min_len = length_line(_x2, _y2, _H[0], _H[1]);
                }
                // highlight_point(_H[0], _H[1], SNAP_POINT_THRES);
            }
        }
        for (var i = 0; i < user['solid_lines'].length; i++) {
            _xB = user['solid_lines'][i][0];
            _yB = user['solid_lines'][i][1];
            _xC = user['solid_lines'][i][2];
            _yC = user['solid_lines'][i][3];

            var _H = get_height_base(_xA, _yA, _xB, _yB, _xC, _yC);
            if (length_line(_x2, _y2, _H[0], _H[1]) < _min_len) {
                _xH_min = _H[0];
                _yH_min = _H[1];
                _min_len = length_line(_x2, _y2, _H[0], _H[1]);
            }
            // highlight_point(_H[0], _H[1], SNAP_POINT_THRES);
        }
        for (var i = 0; i < user['dashed_lines'].length; i++) {
            _xB = user['dashed_lines'][i][0];
            _yB = user['dashed_lines'][i][1];
            _xC = user['dashed_lines'][i][2];
            _yC = user['dashed_lines'][i][3];

            var _H = get_height_base(_xA, _yA, _xB, _yB, _xC, _yC);
            if (length_line(_x2, _y2, _H[0], _H[1]) < _min_len) {
                _xH_min = _H[0];
                _yH_min = _H[1];
                _min_len = length_line(_x2, _y2, _H[0], _H[1]);
            }
            // highlight_point(_H[0], _H[1], SNAP_POINT_THRES);
        }
        highlight_point(_xH_min, _yH_min, SNAP_POINT_THRES);
    }

    // Get height top info
    function get_nearest_point_name(_x, _y) {
        // Scan through points
        var _labels = user['labels'];
        if (Object.size(author) != 0) {
            _labels = _labels.concat(author['labels']);
        }
        var _min = 50;
        var _min_index = -1;

        for (var i = 0; i < _labels.length; i++) {
            if (length_line(_x, _y, _labels[i][0], _labels[i][1]) < _min) {
                _min = length_line(_x, _y, _labels[i][0], _labels[i][1]);
                _min_index = i;
            }
        }

        if (_min_index != -1) {
            return _labels[_min_index][2];
        }
        else {
            return '';
        }
    }

    // Get Height base. A is the outside point, BC is the base line. H is the height base, lie in BC.
    function get_height_base(_xA, _yA, _xB, _yB, _xC, _yC) {
        if (_yB == _yC) {
            _xH = _xA;
            _yH = _yB;
        }
        else if (_xB == _xC) {
            _xH = _xB;
            _yH = _yA;
        }
        else {
            var k = (_yC - _yB)/(_xC - _xB);
            var m = (_yB - k * _xB);
            var _xH = (_yA + _xA / k - m)/(k + 1/k);
            var _yH = k * (_yA + _xA/k - m) / (k + 1/k) + m;
        }
        return [_xH, _yH];
    }

    // Highlight circle
    function highlight_circle(_circle) {
        plot_point_circle(_circle[0], _circle[1], 'red');
        draw_arc(_circle[0], _circle[1], _circle[2], 0, 2 * Math.PI, false, 'red');
    }

    // Highlight point
    function highlight_label(_label) {
        write_label(_label[0], _label[1], _label[2], 'red');
    }

    // Highlight point
    function highlight_point(_x, _y, _threshold) {
        draw_arc(_x, _y, _threshold, 0, 2 * Math.PI, false, 'red');
        plot_point_circle(_x, _y, 'red');
    }

    // Highlight line
    function highlight_line(_x1, _y1, _x2, _y2, _threshold) {
        highlight_point(_x1, _y1, SNAP_POINT_THRES);
        highlight_point(_x2, _y2, SNAP_POINT_THRES);
        draw_solid_line(_x1, _y1, _x2, _y2, 'red');
    }

    // Highlight compass
    function highlight_compass(_compass) {
        var _c_x1 = _compass[1][0];
        var _c_y1 = _compass[1][1];

        for (var i = 2; i < _compass.length; i++) {
            var _c_x2 = _compass[i][0];
            var _c_y2 = _compass[i][1];

            draw_solid_line(_c_x1, _c_y1, _c_x2, _c_y2, 'red');
            _c_x1 = _c_x2;
            _c_y1 = _c_y2;
        }
    }

    // Draw compass
    function draw_compass(ox, oy, x1, y1) {
        var _x0 = (ox + x1)/2;
        var _y0 = (oy + y1)/2;
        var _L = COMPASS_LENGTH;

        if (ox != x1 && oy != y1) {
            var _K = (y1 - oy)/(x1 - ox);
            var _D = length_line(ox, oy, x1, y1);
            var _H = Math.sqrt(_L*_L - _D*_D/4);

            var _xT = _x0 + _H/Math.sqrt(1 + 1/(_K*_K));
            var _yT = _y0 + (-1/_K)*(_xT - _x0);

            if (y1 > oy) {
                _yT = 2 * _y0 - _yT;
                _xT = 2 * _x0 - _xT;
            }

            var _snap_Z = get_circle_snap_points(_xT, _yT, _x0, _y0, _H + division);
            var _snap_side_1 = get_circle_snap_points(x1, y1, _x0, _y0, (_D/2) + division);
            var _snap_side_2 = get_circle_snap_points(ox, oy, _x0, _y0, (_D/2) + division);
            var _snap_side_3 = get_circle_snap_points(_snap_side_1[0], _snap_side_1[1], _xT, _yT, _L*4/5);
            var _snap_side_4 = get_circle_snap_points(_snap_side_2[0], _snap_side_2[1], _xT, _yT, _L*4/5);
            var _snap_side_5 = get_circle_snap_points(x1, y1, _xT, _yT, _L*9/10);
            var _snap_side_6 = get_circle_snap_points(ox, oy, _xT, _yT, _L*9/10);
        }
        else if (ox == x1 && oy == y1) {
            var _xT = ox;
            var _yT = oy - _L;

            var _snap_Z = [ox, _yT - division];
            var _snap_side_3 = [ox - division, oy - 2 * division];
            var _snap_side_4 = [ox + division, oy - 2 * division];
            var _snap_side_5 = get_circle_snap_points(ox, oy, _xT, _yT, _L*9/10);
            var _snap_side_6 = get_circle_snap_points(ox, oy, _xT, _yT, _L*9/10);
            draw_solid_line(_snap_side_4[0], _snap_side_4[1], ox, oy, 'grey');
        }
        else if (oy == y1) {
            var _K = (y1 - oy)/(x1 - ox);
            var _D = length_line(ox, oy, x1, y1);
            var _H = Math.sqrt(_L*_L - _D*_D/4);

            var _xT = _x0;
            var _yT = _y0 - _H;

            if (x1 > ox) {
                _yT = 2 * _y0 - _yT;
                _xT = 2 * _x0 - _xT;
            }

            var _snap_Z = get_circle_snap_points(_xT, _yT, _x0, _y0, _H + division);
            var _snap_side_1 = get_circle_snap_points(x1, y1, _x0, _y0, (_D/2) + division);
            var _snap_side_2 = get_circle_snap_points(ox, oy, _x0, _y0, (_D/2) + division);
            var _snap_side_3 = get_circle_snap_points(_snap_side_1[0], _snap_side_1[1], _xT, _yT, _L*4/5);
            var _snap_side_4 = get_circle_snap_points(_snap_side_2[0], _snap_side_2[1], _xT, _yT, _L*4/5);
            var _snap_side_5 = get_circle_snap_points(x1, y1, _xT, _yT, _L*9/10);
            var _snap_side_6 = get_circle_snap_points(ox, oy, _xT, _yT, _L*9/10);
        }
        else if (ox == x1) {
            var _D = length_line(ox, oy, x1, y1);
            var _H = Math.sqrt(_L*_L - _D*_D/4);

            var _xT = _x0 + _H;
            var _yT = _y0;

            if (y1 > oy) {
                _yT = 2 * _y0 - _yT;
                _xT = 2 * _x0 - _xT;
            }

            var _snap_Z = get_circle_snap_points(_xT, _yT, _x0, _y0, _H + division);
            var _snap_side_1 = get_circle_snap_points(x1, y1, _x0, _y0, (_D/2) + division);
            var _snap_side_2 = get_circle_snap_points(ox, oy, _x0, _y0, (_D/2) + division);
            var _snap_side_3 = get_circle_snap_points(_snap_side_1[0], _snap_side_1[1], _xT, _yT, _L*4/5);
            var _snap_side_4 = get_circle_snap_points(_snap_side_2[0], _snap_side_2[1], _xT, _yT, _L*4/5);
            var _snap_side_5 = get_circle_snap_points(x1, y1, _xT, _yT, _L*9/10);
            var _snap_side_6 = get_circle_snap_points(ox, oy, _xT, _yT, _L*9/10);
        }

        var _snap_pen_1 = get_circle_snap_points(_snap_side_3[0], _snap_side_3[1], x1, y1, interval);
        var _snap_pen_2 = get_circle_snap_points(_snap_side_3[0], _snap_side_3[1], x1, y1, division);
        var _snap_pen_3 = get_circle_snap_points(_snap_side_3[0], _snap_side_3[1], x1, y1, division *4/5);
        var _snap_pen_4 = get_circle_snap_points(_snap_side_3[0], _snap_side_3[1], x1, y1, division *3/5);
        var _snap_pen_5 = get_circle_snap_points(_snap_side_3[0], _snap_side_3[1], x1, y1, division *2/5);
        var _snap_pen_6 = get_circle_snap_points(_snap_side_3[0], _snap_side_3[1], x1, y1, division *1/5);
        draw_solid_line(_snap_Z[0], _snap_Z[1], _xT, _yT, 'black', 5);
        draw_solid_line(_snap_side_5[0], _snap_side_5[1], _xT, _yT, '#5ABA47');
        draw_solid_line(_snap_side_6[0], _snap_side_6[1], _xT, _yT, '#5ABA47');
        draw_solid_line(_snap_side_3[0], _snap_side_3[1], _xT, _yT, '#5ABA47');
        draw_solid_line(_snap_side_4[0], _snap_side_4[1], _xT, _yT, '#5ABA47');
        draw_solid_line(_snap_side_3[0], _snap_side_3[1], _snap_side_5[0], _snap_side_5[1], '#5ABA47');
        draw_solid_line(_snap_side_4[0], _snap_side_4[1], _snap_side_6[0], _snap_side_6[1], '#5ABA47');
        draw_solid_line(ox, oy, _snap_side_6[0], _snap_side_6[1], 'grey');
        draw_solid_line(_snap_pen_1[0],_snap_pen_1[1],_snap_pen_2[0],_snap_pen_2[1],'brown','4');
        draw_solid_line(_snap_pen_3[0],_snap_pen_3[1],_snap_pen_4[0],_snap_pen_4[1],'brown','3');
        draw_solid_line(_snap_pen_4[0],_snap_pen_4[1],_snap_pen_5[0],_snap_pen_5[1],'brown','2');
        draw_solid_line(_snap_pen_5[0],_snap_pen_5[1],_snap_pen_6[0],_snap_pen_6[1],'brown','1');
        draw_solid_line(_snap_pen_6[0],_snap_pen_6[1], x1, y1,'brown');
    }

    // Transfer user data to transition data, to avoid passing by reference
    function transfer_user_data(_data) {
        var _result = [];
        for (var i = 0; i < _data.length; i++) {
            _result[i] = _data[i];
        }
        return _result;
    }

    // Checking whether transition object has data
    function transition_data_not_empty(_trans) {
        if (_trans != null) {
            for (var i = 0; i < _trans.user.dot_points.length; i++) {
                if (_trans.user.dot_points[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.user.cross_points.length; i++) {
                if (_trans.user.cross_points[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.user.solid_lines.length; i++) {
                if (_trans.user.solid_lines[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.user.dashed_lines.length; i++) {
                if (_trans.user.dashed_lines[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.user.circles.length; i++) {
                if (_trans.user.circles[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.user.labels.length; i++) {
                if (_trans.user.labels[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.user.heights.length; i++) {
                if (_trans.user.heights[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.user.compass.length; i++) {
                if (_trans.user.compass[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.dot_points.length; i++) {
                if (_trans.author.dot_points[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.cross_points.length; i++) {
                if (_trans.author.cross_points[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.solid_lines.length; i++) {
                if (_trans.author.solid_lines[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.dashed_lines.length; i++) {
                if (_trans.author.dashed_lines[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.circles.length; i++) {
                if (_trans.author.circles[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.labels.length; i++) {
                if (_trans.author.labels[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.heights.length; i++) {
                if (_trans.author.heights[i].length > 0) return false;
            }
            for (var i = 0; i < _trans.author.compass.length; i++) {
                if (_trans.author.compass[i].length > 0) return false;
            }
        }
        return true;
    }

    // Highlight selected items within the selecting area
    function highlight_selected(_x1, _y1, _x2, _y2) {
        var _trans = {
            'user': {
                'dot_points':   [],
                'cross_points': [],
                'solid_lines':  [],
                'dashed_lines': [],
                'circles':      [],
                'labels':       [],
                'heights':      [],
                'compass':      [],
            }, 
            'author':{
                'dot_points':   [],
                'cross_points': [],
                'solid_lines':  [],
                'dashed_lines': [],
                'circles':      [],
                'labels':       [],
                'heights':      [],
                'compass':      [],
            }
        };

        _trans.user = highlight_selected_type(user, _trans.user, _x1, _y1, _x2, _y2);
        _trans.author = highlight_selected_type(author, _trans.author, _x1, _y1, _x2, _y2);

        return _trans;
    }

    // Highlight selected type
    function highlight_selected_type(_type, _trans_type, _x1, _y1, _x2, _y2) {
        // User dot points
        if (_type['dot_points'] != null) {
            for (var i = 0; i < _type['dot_points'].length; i++) {
                _trans_type.dot_points[i] = [];
                if (point_selected(_x1, _y1, _x2, _y2, _type['dot_points'][i])) {
                    highlight_point(_type['dot_points'][i][0], _type['dot_points'][i][1], SNAP_POINT_THRES);
                    _trans_type.dot_points[i] = transfer_user_data(_type['dot_points'][i]); // Avoid pass by reference
                }
            }
        }

        // User cross points
        if (_type['cross_points'] != null) {
            for (var i = 0; i < _type['cross_points'].length; i++) {
                _trans_type.cross_points[i] = [];
                if (point_selected(_x1, _y1, _x2, _y2, _type['cross_points'][i])) {
                    highlight_point(_type['cross_points'][i][0], _type['cross_points'][i][1], SNAP_POINT_THRES);
                    _trans_type.cross_points[i] = transfer_user_data(_type['cross_points'][i]);
                }
            }
        }

        // User solid lines
        if (_type['solid_lines'] != null) {
            for (var i = 0; i < _type['solid_lines'].length; i++) {
                _trans_type.solid_lines[i] = [];
                if (line_selected(_x1, _y1, _x2, _y2, _type['solid_lines'][i])) {
                    highlight_line(_type['solid_lines'][i][0], _type['solid_lines'][i][1], _type['solid_lines'][i][2], _type['solid_lines'][i][3], SNAP_POINT_THRES);
                    _trans_type.solid_lines[i] = transfer_user_data(_type['solid_lines'][i]);
                }
            }
        }

        // User dashed lines
        if (_type['dashed_lines'] != null) {
            for (var i = 0; i < _type['dashed_lines'].length; i++) {
                _trans_type.dashed_lines[i] = [];
                if (line_selected(_x1, _y1, _x2, _y2, _type['dashed_lines'][i])) {
                    highlight_line(_type['dashed_lines'][i][0], _type['dashed_lines'][i][1], _type['dashed_lines'][i][2], _type['dashed_lines'][i][3], SNAP_POINT_THRES);
                    _trans_type.dashed_lines[i] = transfer_user_data(_type['dashed_lines'][i]);
                }
            }
        }

        // User circles
        if (_type['circles'] != null) {
            for (var i = 0; i < _type['circles'].length; i++) {
                _trans_type.circles[i] = [];
                if (circle_selected(_x1, _y1, _x2, _y2, _type['circles'][i])) {
                    highlight_circle(_type['circles'][i]);
                    _trans_type.circles[i] = transfer_user_data(_type['circles'][i]);
                }
            }
        }

        // User labels
        if (_type['labels'] != null) {
            for (var i = 0; i < _type['labels'].length; i++) {
                _trans_type.labels[i] = [];
                if (point_selected(_x1, _y1, _x2, _y2, _type['labels'][i])) {
                    highlight_label(_type['labels'][i]);
                    _trans_type.labels[i] = transfer_user_data(_type['labels'][i]);
                }
            }
        }

        // User heights
        if (_type['heights'] != null) {
            for (var i = 0; i < _type['heights'].length; i++) {
                _trans_type.heights[i] = [];
                if (line_selected(_x1, _y1, _x2, _y2, _type['heights'][i])) {
                    highlight_line(_type['heights'][i][0], _type['heights'][i][1], _type['heights'][i][2], _type['heights'][i][3], SNAP_POINT_THRES);
                    _trans_type.heights[i] = transfer_user_data(_type['heights'][i]);
                }
            }
        }

        // User compasses
        if (_type['compass'] != null) {
            for (var i = 0; i < _type['compass'].length; i++) {
                _trans_type.compass[i] = [];
                if (compass_selected(_x1, _y1, _x2, _y2, _type['compass'][i])) {
                    highlight_compass(_type['compass'][i]);
                    _trans_type.compass[i] = transfer_user_data(JSON.parse(JSON.stringify(_type['compass'][i])));   // Damn hell JS: Have to deep-clone this array
                }
            }
        }

        return _trans_type;
    }

    // Check whether the compass is selected
    function compass_selected(_x1, _y1, _x2, _y2, _compass) {
        // First stating point of the compass
        var _c_x1 = _compass[1][0];
        var _c_y1 = _compass[1][1];

        for (var i = 2; i < _compass.length; i++) {
            var _c_x2 = _compass[i][0];
            var _c_y2 = _compass[i][1];

            var _line = [_c_x1, _c_y1, _c_x2, _c_y2];
            if (line_selected(_x1, _y1, _x2, _y2, _line)) return true;

            _c_x1 = _c_x2;
            _c_y1 = _c_y2;
        }

        return false;
    }

    // Check whether the circle is selected
    function circle_selected(_x1, _y1, _x2, _y2, _circle) {
        var _x = _circle[0];
        var _y = _circle[1];
        var _r = _circle[2];

        if (
            ((_x1 <= _x && _x <= _x2) || (_x2 <= _x && _x <= _x1)) &&   // Between x
            ((_y1 <= _y && _y <= _y2) || (_y2 <= _y && _y <= _y1))      // Between y
            )
            return true;
        else if (length_line(_x, _y, _x1, _y1) < _r ||
            length_line(_x, _y, _x1, _y2) < _r ||
            length_line(_x, _y, _x2, _y1) < _r ||
            length_line(_x, _y, _x2, _y2) < _r
            )
            return true;
        else if (
            (Math.min(Math.abs(_x - _x1), Math.abs(_x - _x2)) < _r && ((_y1 <= _y && _y <= _y2) || (_y2 <= _y && _y <= _y1))) ||
            (Math.min(Math.abs(_y - _y1), Math.abs(_y - _y2)) < _r && ((_x1 <= _x && _x <= _x2) || (_x2 <= _x && _x <= _x1)))
            )
            return true;
        else
            return false;
    }

    // Check whether the line is selected
    function line_selected(_x1, _y1, _x2, _y2, _line) {
        _xA = _line[0];
        _yA = _line[1];
        _xB = _line[2];
        _yB = _line[3];

        // If out of bound, return false
        if  (
                // If the _line is horizontally out of bound
                Math.max(_xA, _xB) < Math.min(_x1, _x2)
                || Math.min(_xA, _xB) > Math.max(_x1, _x2)
                // If the _line is vertically out of bound
                || Math.max(_yA, _yB) < Math.min(_y1, _y2)
                || Math.min(_yA, _yB) > Math.max(_y1, _y2)
            ) {
            return false;
        }
        else {
            if (_xA != _xB) {
                // Equation of the _line, y = Ax + B
                var _A = (_yA - _yB) / (_xA - _xB);
                var _B = (_xA*_yB - _xB*_yA) / (_xA - _xB);

                // If the _line cuts the selection box, at least one of the intersection point with the 2 vertical sides must me within the side positions
                var _y_cut_1 = _A * _x1 + _B;
                var _y_cut_2 = _A * _x2 + _B;
                if ((_y1 <= _y_cut_1 && _y_cut_1 <= _y2)
                    || (_y2 <= _y_cut_1 && _y_cut_1 <= _y1)
                    || (_y1 <= _y_cut_2 && _y_cut_2 <= _y2)
                    || (_y2 <= _y_cut_2 && _y_cut_2 <= _y1)) {
                    return true;
                }

                // .. or horizontal sides
                var _x_cut_1 = (_y1 - _B) / _A;
                var _x_cut_2 = (_y2 - _B) / _A;
                if ((_x1 <= _x_cut_1 && _x_cut_1 <= _x2)
                    || (_x2 <= _x_cut_1 && _x_cut_1 <= _x1)
                    || (_x1 <= _x_cut_2 && _x_cut_2 <= _x2)
                    || (_x2 <= _x_cut_2 && _x_cut_2 <= _x1)) {
                    return true;
                }
            }
            else {
                if ((_y1 <= _yA && _yA <= _y2)
                    || (_y1 <= _yB && _yB <= _y2)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Check whether the point is selected
    function point_selected(_x1, _y1, _x2, _y2, _point) {
        var _x = _point[0];
        var _y = _point[1];

        if (
            ((_x1 <= _x && _x <= _x2) || (_x2 <= _x && _x <= _x1)) &&   // Between x
            ((_y1 <= _y && _y <= _y2) || (_y2 <= _y && _y <= _y1))      // Between y
            )
            return true;
        else
            return false;
    }

    // Helper function to draw select box
    function draw_select_box(_select) {
        // If the select box is horizontal
        if (_select.length == 4) {
            draw_dashed_line(_select[0], _select[1], _select[0], _select[3], 'green');
            draw_dashed_line(_select[0], _select[1], _select[2], _select[1], 'green');
            draw_dashed_line(_select[0], _select[3], _select[2], _select[3], 'green');
            draw_dashed_line(_select[2], _select[1], _select[2], _select[3], 'green');
        }
        // If the select box is rotated
        else {
            draw_dashed_line(_select[0], _select[1], _select[4], _select[5], 'green');
            draw_dashed_line(_select[0], _select[1], _select[6], _select[7], 'green');
            draw_dashed_line(_select[2], _select[3], _select[4], _select[5], 'green');
            draw_dashed_line(_select[2], _select[3], _select[6], _select[7], 'green');
        }
    }

    // Helper function to snap rotation point, after moving an angle
    function snap_rotate_point(_rad, _center_x, _center_y, _trans_x, _trans_y, _last_x, _last_y) {
        var _rad_1 = Math.atan2(_trans_y - _center_y, _trans_x - _center_x);
        var _rad_2 = _rad_1 + _rad;

        // Construct new rotation
        var _r = length_line(_center_x, _center_y, _trans_x, _trans_y);
        var _x = 1;
        var _y = (_x - _center_x) * Math.tan(_rad_2) + _center_y;
        var _snap = get_circle_snap_points(_x, _y, _center_x, _center_y, _r);
        if (length_line(_last_x, _last_y, _snap[0], _snap[1]) < SNAP_POINT_THRES) {
            return _snap;
        }
        else {
            return [2*_center_x-_snap[0], 2*_center_y-_snap[1]];
        }
    }

    // Copy transition
    function copy_transition(_trans, _select) {
        // Move user item
        for (var i = 0; i < _trans.user.dot_points.length; i++) {
            if (_trans.user.dot_points[i].length > 0) {
                _trans.user.dot_points[i][0] -= _select[0];
                _trans.user.dot_points[i][1] -= _select[1];
                user['dot_points'].push(_trans.user.dot_points[i]);
                undo_stack.push('dot_points');
            }
        }
        for (var i = 0; i < _trans.user.cross_points.length; i++) {
            if (_trans.user.cross_points[i].length > 0) {
                _trans.user.cross_points[i][0] -= _select[0];
                _trans.user.cross_points[i][1] -= _select[1];
                user['cross_points'].push(_trans.user.cross_points[i]);
                undo_stack.push('cross_points');
            }
        }
        for (var i = 0; i < _trans.user.labels.length; i++) {
            if (_trans.user.labels[i].length > 0) {
                _trans.user.labels[i][0] -= _select[0];
                _trans.user.labels[i][1] -= _select[1];
                user['labels'].push(_trans.user.labels[i]);
                undo_stack.push('labels');
            }
        }
        for (var i = 0; i < _trans.user.solid_lines.length; i++) {
            if (_trans.user.solid_lines[i].length > 0) {
                _trans.user.solid_lines[i][0] -= _select[0];
                _trans.user.solid_lines[i][1] -= _select[1];
                _trans.user.solid_lines[i][2] -= _select[0];
                _trans.user.solid_lines[i][3] -= _select[1];
                user['solid_lines'].push(_trans.user.solid_lines[i]);
                undo_stack.push('solid_lines');
            }
        }
        for (var i = 0; i < _trans.user.dashed_lines.length; i++) {
            if (_trans.user.dashed_lines[i].length > 0) {
                _trans.user.dashed_lines[i][0] -= _select[0];
                _trans.user.dashed_lines[i][1] -= _select[1];
                _trans.user.dashed_lines[i][2] -= _select[0];
                _trans.user.dashed_lines[i][3] -= _select[1];
                user['dashed_lines'].push(_trans.user.dashed_lines[i]);
                undo_stack.push('dashed_lines');
            }
        }
        for (var i = 0; i < _trans.user.heights.length; i++) {
            if (_trans.user.heights[i].length > 0) {
                _trans.user.heights[i][0] -= _select[0];
                _trans.user.heights[i][1] -= _select[1];
                _trans.user.heights[i][2] -= _select[0];
                _trans.user.heights[i][3] -= _select[1];
                _trans.user.heights[i][4] -= _select[0];
                _trans.user.heights[i][5] -= _select[1];
                _trans.user.heights[i][6] -= _select[0];
                _trans.user.heights[i][7] -= _select[1];
                _trans.user.heights[i][8] -= _select[0];
                _trans.user.heights[i][9] -= _select[1];
                user['heights'].push(_trans.user.heights[i]);
                undo_stack.push('heights');
            }
        }
        for (var i = 0; i < _trans.user.circles.length; i++) {
            if (_trans.user.circles[i].length > 0) {
                _trans.user.circles[i][0] -= _select[0];
                _trans.user.circles[i][1] -= _select[1];
                user['circles'].push(_trans.user.circles[i]);
                undo_stack.push('circles');
            }
        }
        for (var i = 0; i < _trans.user.compass.length; i++) {
            if (_trans.user.compass[i].length > 0) {
                for (var j = 1; j < _trans.user.compass[i].length; j++) {
                    _trans.user.compass[i][j][0] -= _select[0];
                    _trans.user.compass[i][j][1] -= _select[1];
                }
                user['compass'].push(_trans.user.compass[i]);
                undo_stack.push('compass');
            }
        }
    }

    // Restore transition
    function restore_transition(_trans, _delta_x, _delta_y, _measure, _rotate) {
        // Delete user items
        if (_delta_x == null && _delta_y == null && _measure == null) {
            // Move user item
            for (var i = 0; i < _trans.user.dot_points.length; i++) {
                if (_trans.user.dot_points[i].length > 0) {
                    user['dot_points'][i][0] = -1;
                    user['dot_points'][i][1] = -1;
                }
            }
            for (var i = 0; i < _trans.user.cross_points.length; i++) {
                if (_trans.user.cross_points[i].length > 0) {
                    user['cross_points'][i][0] = -1;
                    user['cross_points'][i][1] = -1;
                }
            }
            for (var i = 0; i < _trans.user.labels.length; i++) {
                if (_trans.user.labels[i].length > 0) {
                    user['labels'][i][0] = -1;
                    user['labels'][i][1] = -1;
                }
            }
            for (var i = 0; i < _trans.user.solid_lines.length; i++) {
                if (_trans.user.solid_lines[i].length > 0) {
                    user['solid_lines'][i][0] = -1;
                    user['solid_lines'][i][1] = -1;
                    user['solid_lines'][i][2] = -1;
                    user['solid_lines'][i][3] = -1;
                }
            }
            for (var i = 0; i < _trans.user.dashed_lines.length; i++) {
                if (_trans.user.dashed_lines[i].length > 0) {
                    user['dashed_lines'][i][0] = -1;
                    user['dashed_lines'][i][1] = -1;
                    user['dashed_lines'][i][2] = -1;
                    user['dashed_lines'][i][3] = -1;
                }
            }
            for (var i = 0; i < _trans.user.heights.length; i++) {
                if (_trans.user.heights[i].length > 0) {
                    user['heights'][i][0] = -1;
                    user['heights'][i][1] = -1;
                    user['heights'][i][2] = -1;
                    user['heights'][i][3] = -1;
                    user['heights'][i][4] = -1;
                    user['heights'][i][5] = -1;
                    user['heights'][i][6] = -1;
                    user['heights'][i][7] = -1;
                    user['heights'][i][8] = -1;
                    user['heights'][i][9] = -1;
                }
            }
            for (var i = 0; i < _trans.user.circles.length; i++) {
                if (_trans.user.circles[i].length > 0) {
                    user['circles'][i][0] = -1;
                    user['circles'][i][1] = -1;
                    user['circles'][i][2] = 0;
                }
            }
            for (var i = 0; i < _trans.user.compass.length; i++) {
                if (_trans.user.compass[i].length > 0) {
                    user['compass'][i] = [];
                }
            }
            return;
        }

        move_trans_type(user, _trans.user, _delta_x, _delta_y, _measure, _rotate);
        move_trans_type(author, _trans.author, _delta_x, _delta_y, _measure, _rotate);
    }

    // Move trans type
    function move_trans_type(_type, _trans_type, _delta_x, _delta_y, _measure, _rotate) {
        // Move _type item
        for (var i = 0; i < _trans_type.dot_points.length; i++) {
            if (_trans_type.dot_points[i].length > 0) {
                // Rotate
                if (_rotate != null) {
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.dot_points[i][0], _trans_type.dot_points[i][1], _type['dot_points'][i][0], _type['dot_points'][i][1]);
                    _type['dot_points'][i][0] = _rotate_points[0];
                    _type['dot_points'][i][1] = _rotate_points[1];
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    _type['dot_points'][i][0] = _trans_type.dot_points[i][0] + _delta_x;
                    _type['dot_points'][i][1] = _trans_type.dot_points[i][1] + _delta_y;
                }
                // Scale horizontally
                else if (_measure[0] != null) {
                    var _sign = (_measure[0] - _trans_type.dot_points[i][0]) / Math.abs(_measure[0] - _trans_type.dot_points[i][0]);
                    var _scale = Math.abs(_trans_type.dot_points[i][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['dot_points'][i][0] = _trans_type.dot_points[i][0] + _sign * _scale;
                }
                // Scale vertically
                else if (_measure[1] != null) {
                    var _sign = (_measure[1] - _trans_type.dot_points[i][1]) / Math.abs(_measure[1] - _trans_type.dot_points[i][1]);
                    var _scale = Math.abs(_trans_type.dot_points[i][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['dot_points'][i][1] = _trans_type.dot_points[i][1] + _sign * _scale;
                }
            }
        }
        for (var i = 0; i < _trans_type.cross_points.length; i++) {
            if (_trans_type.cross_points[i].length > 0) {
                // Rotate
                if (_rotate != null) {
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.cross_points[i][0], _trans_type.cross_points[i][1], _type['cross_points'][i][0], _type['cross_points'][i][1]);
                    _type['cross_points'][i][0] = _rotate_points[0];
                    _type['cross_points'][i][1] = _rotate_points[1];
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    _type['cross_points'][i][0] = _trans_type.cross_points[i][0] + _delta_x;
                    _type['cross_points'][i][1] = _trans_type.cross_points[i][1] + _delta_y;
                }
                // Scale horizontally
                else if (_measure[0] != null) {
                    var _sign = (_measure[0] - _trans_type.cross_points[i][0]) / Math.abs(_measure[0] - _trans_type.cross_points[i][0]);
                    var _scale = Math.abs(_trans_type.cross_points[i][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['cross_points'][i][0] = _trans_type.cross_points[i][0] + _sign * _scale;
                }
                // Scale vertically
                else if (_measure[1] != null) {
                    var _sign = (_measure[1] - _trans_type.cross_points[i][1]) / Math.abs(_measure[1] - _trans_type.cross_points[i][1]);
                    var _scale = Math.abs(_trans_type.cross_points[i][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['cross_points'][i][1] = _trans_type.cross_points[i][1] + _sign * _scale;
                }
            }
        }
        for (var i = 0; i < _trans_type.labels.length; i++) {
            if (_trans_type.labels[i].length > 0) {
                // Rotate
                if (_rotate != null) {
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.labels[i][0], _trans_type.labels[i][1], _type['labels'][i][0], _type['labels'][i][1]);
                    _type['labels'][i][0] = _rotate_points[0];
                    _type['labels'][i][1] = _rotate_points[1];
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    _type['labels'][i][0] = _trans_type.labels[i][0] + _delta_x;
                    _type['labels'][i][1] = _trans_type.labels[i][1] + _delta_y;
                }
                // Scale horizontally
                else if (_measure[0] != null) {
                    var _sign = (_measure[0] - _trans_type.labels[i][0]) / Math.abs(_measure[0] - _trans_type.labels[i][0]);
                    var _scale = Math.abs(_trans_type.labels[i][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['labels'][i][0] = _trans_type.labels[i][0] + _sign * _scale;
                }
                // Scale vertically
                else if (_measure[1] != null) {
                    var _sign = (_measure[1] - _trans_type.labels[i][1]) / Math.abs(_measure[1] - _trans_type.labels[i][1]);
                    var _scale = Math.abs(_trans_type.labels[i][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['labels'][i][1] = _trans_type.labels[i][1] + _sign * _scale;
                }
            }
        }
        for (var i = 0; i < _trans_type.solid_lines.length; i++) {
            if (_trans_type.solid_lines[i].length > 0) {
                // Rotate
                if (_rotate != null) {
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.solid_lines[i][0], _trans_type.solid_lines[i][1], _type['solid_lines'][i][0], _type['solid_lines'][i][1]);
                    _type['solid_lines'][i][0] = _rotate_points[0];
                    _type['solid_lines'][i][1] = _rotate_points[1];
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.solid_lines[i][2], _trans_type.solid_lines[i][3], _type['solid_lines'][i][2], _type['solid_lines'][i][3]);
                    _type['solid_lines'][i][2] = _rotate_points[0];
                    _type['solid_lines'][i][3] = _rotate_points[1];
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    _type['solid_lines'][i][0] = _trans_type.solid_lines[i][0] + _delta_x;
                    _type['solid_lines'][i][1] = _trans_type.solid_lines[i][1] + _delta_y;
                    _type['solid_lines'][i][2] = _trans_type.solid_lines[i][2] + _delta_x;
                    _type['solid_lines'][i][3] = _trans_type.solid_lines[i][3] + _delta_y;
                }
                // Scale horizontally
                else if (_measure[0] != null) {
                    var _sign = (_measure[0] - _trans_type.solid_lines[i][0]) / Math.abs(_measure[0] - _trans_type.solid_lines[i][0]);
                    var _scale = Math.abs(_trans_type.solid_lines[i][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['solid_lines'][i][0] = _trans_type.solid_lines[i][0] + _sign * _scale;
                    var _sign = (_measure[0] - _trans_type.solid_lines[i][2]) / Math.abs(_measure[0] - _trans_type.solid_lines[i][2]);
                    var _scale = Math.abs(_trans_type.solid_lines[i][2] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['solid_lines'][i][2] = _trans_type.solid_lines[i][2] + _sign * _scale;
                }
                // Scale vertically
                else if (_measure[1] != null) {
                    var _sign = (_measure[1] - _trans_type.solid_lines[i][1]) / Math.abs(_measure[1] - _trans_type.solid_lines[i][1]);
                    var _scale = Math.abs(_trans_type.solid_lines[i][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['solid_lines'][i][1] = _trans_type.solid_lines[i][1] + _sign * _scale;
                    var _sign = (_measure[1] - _trans_type.solid_lines[i][3]) / Math.abs(_measure[1] - _trans_type.solid_lines[i][3]);
                    var _scale = Math.abs(_trans_type.solid_lines[i][3] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['solid_lines'][i][3] = _trans_type.solid_lines[i][3] + _sign * _scale;
                }
            }
        }
        for (var i = 0; i < _trans_type.dashed_lines.length; i++) {
            if (_trans_type.dashed_lines[i].length > 0) {
                // Rotate
                if (_rotate != null) {
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.dashed_lines[i][0], _trans_type.dashed_lines[i][1], _type['dashed_lines'][i][0], _type['dashed_lines'][i][1]);
                    _type['dashed_lines'][i][0] = _rotate_points[0];
                    _type['dashed_lines'][i][1] = _rotate_points[1];
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.dashed_lines[i][2], _trans_type.dashed_lines[i][3], _type['dashed_lines'][i][2], _type['dashed_lines'][i][3]);
                    _type['dashed_lines'][i][2] = _rotate_points[0];
                    _type['dashed_lines'][i][3] = _rotate_points[1];
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    _type['dashed_lines'][i][0] = _trans_type.dashed_lines[i][0] + _delta_x;
                    _type['dashed_lines'][i][1] = _trans_type.dashed_lines[i][1] + _delta_y;
                    _type['dashed_lines'][i][2] = _trans_type.dashed_lines[i][2] + _delta_x;
                    _type['dashed_lines'][i][3] = _trans_type.dashed_lines[i][3] + _delta_y;
                }
                // Scale horizontally
                else if (_measure[0] != null) {
                    var _sign = (_measure[0] - _trans_type.dashed_lines[i][0]) / Math.abs(_measure[0] - _trans_type.dashed_lines[i][0]);
                    var _scale = Math.abs(_trans_type.dashed_lines[i][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['dashed_lines'][i][0] = _trans_type.dashed_lines[i][0] + _sign * _scale;
                    var _sign = (_measure[0] - _trans_type.dashed_lines[i][2]) / Math.abs(_measure[0] - _trans_type.dashed_lines[i][2]);
                    var _scale = Math.abs(_trans_type.dashed_lines[i][2] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['dashed_lines'][i][2] = _trans_type.dashed_lines[i][2] + _sign * _scale;
                }
                // Scale vertically
                else if (_measure[1] != null) {
                    var _sign = (_measure[1] - _trans_type.dashed_lines[i][1]) / Math.abs(_measure[1] - _trans_type.dashed_lines[i][1]);
                    var _scale = Math.abs(_trans_type.dashed_lines[i][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['dashed_lines'][i][1] = _trans_type.dashed_lines[i][1] + _sign * _scale;
                    var _sign = (_measure[1] - _trans_type.dashed_lines[i][3]) / Math.abs(_measure[1] - _trans_type.dashed_lines[i][3]);
                    var _scale = Math.abs(_trans_type.dashed_lines[i][3] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['dashed_lines'][i][3] = _trans_type.dashed_lines[i][3] + _sign * _scale;
                }
            }
        }
        for (var i = 0; i < _trans_type.heights.length; i++) {
            if (_trans_type.heights[i].length > 0) {
                // Rotate
                if (_rotate != null) {
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.heights[i][0], _trans_type.heights[i][1], _type['heights'][i][0], _type['heights'][i][1]);
                    _type['heights'][i][0] = _rotate_points[0];
                    _type['heights'][i][1] = _rotate_points[1];
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.heights[i][2], _trans_type.heights[i][3], _type['heights'][i][2], _type['heights'][i][3]);
                    _type['heights'][i][2] = _rotate_points[0];
                    _type['heights'][i][3] = _rotate_points[1];
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.heights[i][4], _trans_type.heights[i][5], _type['heights'][i][4], _type['heights'][i][5]);
                    _type['heights'][i][4] = _rotate_points[0];
                    _type['heights'][i][5] = _rotate_points[1];
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.heights[i][6], _trans_type.heights[i][7], _type['heights'][i][6], _type['heights'][i][7]);
                    _type['heights'][i][6] = _rotate_points[0];
                    _type['heights'][i][7] = _rotate_points[1];
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.heights[i][8], _trans_type.heights[i][9], _type['heights'][i][8], _type['heights'][i][9]);
                    _type['heights'][i][8] = _rotate_points[0];
                    _type['heights'][i][9] = _rotate_points[1];
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    _type['heights'][i][0] = _trans_type.heights[i][0] + _delta_x;
                    _type['heights'][i][1] = _trans_type.heights[i][1] + _delta_y;
                    _type['heights'][i][2] = _trans_type.heights[i][2] + _delta_x;
                    _type['heights'][i][3] = _trans_type.heights[i][3] + _delta_y;
                    _type['heights'][i][4] = _trans_type.heights[i][4] + _delta_x;
                    _type['heights'][i][5] = _trans_type.heights[i][5] + _delta_y;
                    _type['heights'][i][6] = _trans_type.heights[i][6] + _delta_x;
                    _type['heights'][i][7] = _trans_type.heights[i][7] + _delta_y;
                    _type['heights'][i][8] = _trans_type.heights[i][8] + _delta_x;
                    _type['heights'][i][9] = _trans_type.heights[i][9] + _delta_y;
                }
                else if (_measure[0] != null) {
                    var _sign = (_measure[0] - _trans_type.heights[i][0]) / Math.abs(_measure[0] - _trans_type.heights[i][0]);
                    var _scale = Math.abs(_trans_type.heights[i][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['heights'][i][0] = _trans_type.heights[i][0] + _sign * _scale;

                    var _sign = (_measure[0] - _trans_type.heights[i][2]) / Math.abs(_measure[0] - _trans_type.heights[i][2]);
                    var _scale = Math.abs(_trans_type.heights[i][2] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['heights'][i][2] = _trans_type.heights[i][2] + _sign * _scale;

                    var _sign = (_measure[0] - _trans_type.heights[i][4]) / Math.abs(_measure[0] - _trans_type.heights[i][4]);
                    var _scale = Math.abs(_trans_type.heights[i][4] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['heights'][i][4] = _trans_type.heights[i][4] + _sign * _scale;

                    var _sign = (_measure[0] - _trans_type.heights[i][6]) / Math.abs(_measure[0] - _trans_type.heights[i][6]);
                    var _scale = Math.abs(_trans_type.heights[i][6] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['heights'][i][6] = _trans_type.heights[i][6] + _sign * _scale;

                    var _sign = (_measure[0] - _trans_type.heights[i][8]) / Math.abs(_measure[0] - _trans_type.heights[i][8]);
                    var _scale = Math.abs(_trans_type.heights[i][8] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['heights'][i][8] = _trans_type.heights[i][8] + _sign * _scale;
                }
                else if (_measure[1] != null) {
                    var _sign = (_measure[1] - _trans_type.heights[i][1]) / Math.abs(_measure[1] - _trans_type.heights[i][1]);
                    var _scale = Math.abs(_trans_type.heights[i][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['heights'][i][1] = _trans_type.heights[i][1] + _sign * _scale;

                    var _sign = (_measure[1] - _trans_type.heights[i][3]) / Math.abs(_measure[1] - _trans_type.heights[i][3]);
                    var _scale = Math.abs(_trans_type.heights[i][3] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['heights'][i][3] = _trans_type.heights[i][3] + _sign * _scale;

                    var _sign = (_measure[1] - _trans_type.heights[i][5]) / Math.abs(_measure[1] - _trans_type.heights[i][5]);
                    var _scale = Math.abs(_trans_type.heights[i][5] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['heights'][i][5] = _trans_type.heights[i][5] + _sign * _scale;

                    var _sign = (_measure[1] - _trans_type.heights[i][7]) / Math.abs(_measure[1] - _trans_type.heights[i][7]);
                    var _scale = Math.abs(_trans_type.heights[i][7] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['heights'][i][7] = _trans_type.heights[i][7] + _sign * _scale;

                    var _sign = (_measure[1] - _trans_type.heights[i][9]) / Math.abs(_measure[1] - _trans_type.heights[i][9]);
                    var _scale = Math.abs(_trans_type.heights[i][9] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['heights'][i][9] = _trans_type.heights[i][9] + _sign * _scale;
                }
            }
        }
        for (var i = 0; i < _trans_type.circles.length; i++) {
            if (_trans_type.circles[i].length > 0) {
                // Rotate
                if (_rotate != null) {
                    _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.circles[i][0], _trans_type.circles[i][1], _type['circles'][i][0], _type['circles'][i][1]);
                    _type['circles'][i][0] = _rotate_points[0];
                    _type['circles'][i][1] = _rotate_points[1];
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    _type['circles'][i][0] = _trans_type.circles[i][0] + _delta_x;
                    _type['circles'][i][1] = _trans_type.circles[i][1] + _delta_y;
                    _type['circles'][i][2] = _trans_type.circles[i][2]; // Restoring after delete
                }
                // Scale horizontally
                else if (_measure[0] != null) {
                    var _sign = (_measure[0] - _trans_type.circles[i][0]) / Math.abs(_measure[0] - _trans_type.circles[i][0]);
                    var _scale = Math.abs(_trans_type.circles[i][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                    _type['circles'][i][0] = _trans_type.circles[i][0] + _sign * _scale;
                }
                // Scale vertically
                else if (_measure[1] != null) {
                    var _sign = (_measure[1] - _trans_type.circles[i][1]) / Math.abs(_measure[1] - _trans_type.circles[i][1]);
                    var _scale = Math.abs(_trans_type.circles[i][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                    _type['circles'][i][1] = _trans_type.circles[i][1] + _sign * _scale;
                }
            }
        }
        for (var i = 0; i < _trans_type.compass.length; i++) {
            if (_trans_type.compass[i].length > 0) {
                _type['compass'][i][0] = _trans_type.compass[i][0];
                // Rotate
                if (_rotate != null) {
                    for (var j = 1; j < _trans_type.compass[i].length; j++) {
                        _rotate_points = snap_rotate_point(_rotate[0], _rotate[1], _rotate[2], _trans_type.compass[i][j][0], _trans_type.compass[i][j][1], _type['compass'][i][j][0], _type['compass'][i][j][1]);
                        _type['compass'][i][j][0] = _rotate_points[0];
                        _type['compass'][i][j][1] = _rotate_points[1];
                    }
                }
                // Dragging only / Restore transition
                else if (_measure.length == 0) {
                    for (var j = 1; j < _trans_type.compass[i].length; j++) {
                        _type['compass'][i][j] = [];
                        _type['compass'][i][j][0] = _trans_type.compass[i][j][0] + _delta_x;
                        _type['compass'][i][j][1] = _trans_type.compass[i][j][1] + _delta_y;
                    }
                }
                else if (_measure[0] != null) {
                    for (var j = 1; j < _trans_type.compass[i].length; j++) {
                        var _sign = (_measure[0] - _trans_type.compass[i][j][0]) / Math.abs(_measure[0] - _trans_type.compass[i][j][0]);
                        var _scale = Math.abs(_trans_type.compass[i][j][0] - _measure[0]) * _delta_x / Math.abs(_measure[2]);
                        _type['compass'][i][j][0] = _trans_type.compass[i][j][0] + _sign * _scale;
                    }
                }
                else if (_measure[1] != null) {
                    for (var j = 1; j < _trans_type.compass[i].length; j++) {
                        var _sign = (_measure[1] - _trans_type.compass[i][j][1]) / Math.abs(_measure[1] - _trans_type.compass[i][j][1]);
                        var _scale = Math.abs(_trans_type.compass[i][j][1] - _measure[1]) * _delta_y / Math.abs(_measure[3]);
                        _type['compass'][i][j][1] = _trans_type.compass[i][j][1] + _sign * _scale;
                    }
                }
            }
        }
    }

    // Restore / restore_canvas
    function restore_canvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        restore();
    }

    // Reset locks / Remove locks / reset_locks
    function remove_lock(l) {
        locks['cross']              = true; // Lock user from drawing cross point
        locks['dot']                = true; // Lock user from drawing dotted point
        locks['solid_line']         = true; // Lock user from drawing line
        locks['solid_line_move']    = true; // Lock user from moving line
        locks['dashed_line']        = true; // Lock user from drawing line
        locks['dashed_line_move']   = true; // Lock user from moving line
        locks['label']              = true; // Lock user from entering labels
        locks['circle']             = true; // Lock user from drawing circles
        locks['circle_move']        = true; // Lock user from moving circles
        locks['compass']            = true; // Lock user from setting compass
        locks['compass_rad']        = true; // Lock user from moving compass radius
        locks['compass_draw']       = true; // Lock user from drawing compass circle
        locks['ruler']              = true; // Lock user from setting ruler
        locks['protr']              = true; // Lock user from setting the protractor
        locks['height']             = true; // Lock user from drawing line
        locks['height_move']        = true; // Lock user from moving line
        locks['select']             = true; // Lock user from selecting
        locks['select_move']        = true; // Lock user from moving selecting
        locks['trans']              = true; // Lock user from making transition
        locks['del']                = true; // Lock user from delete transition
        locks['copy']               = true; // Lock user from copy transition
        x1 = x2 = y1 = y2           = null;
        moving_transition           = null;

        // The corresponding locks will be removed
        for (var i = 0; i < l.length; i++) {
            locks[l[i]] = false;
        }
    }

    // Reset user data
    function reset_user_data(obj) {
        if (obj != null) {
            user['cross_points']= (obj.x != null) ? obj.x : [];     // The points entered by users
            user['dot_points']  = (obj.d != null) ? obj.d : [];     // The points entered by users
            user['solid_lines'] = (obj.s != null) ? obj.s : [];     // The lines entered by users
            user['dashed_lines']= (obj.i != null) ? obj.i : [];     // The lines entered by users
            user['circles']     = (obj.o != null) ? obj.o : [];     // The circles entered by users
            user['compass']     = (obj.v != null) ? obj.v : [];     // The drawing set by users' compass
            user['labels']      = (obj.l != null) ? obj.l : [];     // The label entered by users
            user['ruler']       = (obj.r != null) ? obj.r : [];     // The ruler set by users
            user['protr']       = (obj.p != null) ? obj.p : [];     // The protractor set by users
            user['heights']     = (obj.hg != null) ? obj.hg : [];   // The heights entered by users
            undo_stack          = (obj.u != null) ? obj.u : [];     // The undo stack
        } else {
            user['cross_points']= [];     // The points entered by users
            user['dot_points']  = [];     // The points entered by users
            user['solid_lines'] = [];     // The lines entered by users
            user['dashed_lines']= [];     // The lines entered by users
            user['circles']     = [];     // The circles entered by users
            user['compass']     = [];     // The drawing set by users' compass
            user['labels']      = [];     // The label entered by users
            user['ruler']       = [];     // The ruler set by users
            user['protr']       = [];     // The protractor set by users
            user['heights']     = [];   // The heights entered by users
            undo_stack          = [];     // The undo stack
        }
        reset_redo();
    }

    // Reset redo stack & other data that not need to be loaded from DB (just create new)
    function reset_redo() {
        // Redo stack
        user_redo['cross_points']   = [];   // The points entered by users
        user_redo['dot_points']     = [];   // The points entered by users
        user_redo['solid_lines']    = [];   // The lines entered by users
        user_redo['dashed_lines']   = [];   // The lines entered by users
        user_redo['circles']        = [];   // The circles entered by users
        user_redo['compass']        = [];   // The drawing set by users' compass
        user_redo['labels']         = [];   // The label entered by users
        user_redo['ruler']          = [];   // The ruler set by users
        user_redo['protr']          = [];   // The protractor set by users
        user_redo['heights']        = [];   // The heights entered by users
        redo_stack                  = [];   // The redo stack
        redo_btn.firstChild.src     = '/css/images/geo2d/redo-passive.png';

        // Transition & del
        user['select']              = [];   // The select box draw by user
        user['trans']               = [];   // The transitions made by users - for undo
        user['del']                 = [];   // The deletions made by user - for undo
        user_redo['trans']          = [];   // The transitions made by users - for redo
        user_redo['del']            = [];   // The deletions made by user - for redo
    }

    // Reset author data
    function set_author_data(obj) {
        if (obj != null) {
            author['cross_points']  = (obj.x != null) ? obj.x : [];     // The points entered by authors
            author['dot_points']    = (obj.d != null) ? obj.d : [];     // The points entered by authors
            author['solid_lines']   = (obj.s != null) ? obj.s : [];     // The lines entered by authors
            author['dashed_lines']  = (obj.i != null) ? obj.i : [];     // The lines entered by authors
            author['circles']       = (obj.o != null) ? obj.o : [];     // The circles entered by authors
            author['compass']       = (obj.v != null) ? obj.v : [];     // The drawing set by authors' compass
            author['labels']        = (obj.l != null) ? obj.l : [];     // The label entered by authors
            author['ruler']         = (obj.r != null) ? obj.r : [];     // The ruler set by authors
            author['protractor']    = (obj.p != null) ? obj.p : [];     // The protractor set by authors
            author['heights']       = (obj.hg != null) ? obj.hg : [];   // The heights entered by authors
            color                   = 'black';                          // Default color for students
        }
    }

    // Reset user partial data
    function reset_user_partial_data(type) {
        user[type] = [];
        for (var i = 0; i < undo_stack.length; i++) {
            if (undo_stack[i] == type) {
                undo_stack.splice(i, 1);
                i--;
            }
        }

        // if (socket != null) prepare_emit_action('rt', type);
    }

    // Restore all drawings
    function restore() {
        init();
        textbox.style.display = 'none';

        // Restore user cross points
        for (var i = 0; i < user['cross_points'].length; i++) {
            plot_point_cross(user['cross_points'][i][0], user['cross_points'][i][1], user['cross_points'][i][2]);
        }

        // Restore user dot points
        for (var i = 0; i < user['dot_points'].length; i++) {
            plot_point_circle(user['dot_points'][i][0], user['dot_points'][i][1], user['dot_points'][i][2]);
        }

        // Restore user labels
        for (var i = 0; i < user['labels'].length; i++) {
            write_label(user['labels'][i][0], user['labels'][i][1], user['labels'][i][2], user['labels'][i][3]);
        }

        // Restore user solid lines
        for (var i = 0; i < user['solid_lines'].length; i++) {
            draw_solid_line(user['solid_lines'][i][0], user['solid_lines'][i][1], user['solid_lines'][i][2], user['solid_lines'][i][3], user['solid_lines'][i][4]);
        }

        // Restore user dashed lines
        for (var i = 0; i < user['dashed_lines'].length; i++) {
            draw_dashed_line(user['dashed_lines'][i][0], user['dashed_lines'][i][1], user['dashed_lines'][i][2], user['dashed_lines'][i][3], user['dashed_lines'][i][4]);
        }

        // Restore user heights
        for (var i = 0; i < user['heights'].length; i++) {
            draw_solid_line(user['heights'][i][0], user['heights'][i][1], user['heights'][i][2], user['heights'][i][3], user['heights'][i][16]);
            draw_solid_line(user['heights'][i][4], user['heights'][i][5], user['heights'][i][8], user['heights'][i][9], user['heights'][i][16]);
            draw_solid_line(user['heights'][i][6], user['heights'][i][7], user['heights'][i][8], user['heights'][i][9], user['heights'][i][16]);
        }

        // Restore user circles
        for (var i = 0; i < user['circles'].length; i++) {
            plot_point_circle(user['circles'][i][0], user['circles'][i][1], user['circles'][i][3]);
            draw_arc(user['circles'][i][0], user['circles'][i][1], user['circles'][i][2], 0, 2 * Math.PI, false, user['circles'][i][3]);
        }

        // Restore user compass drawings
        for (var i = 0; i < user['compass'].length; i++) {
            if (user['compass'][i].length > 0) {
                var _x1 = user['compass'][i][1][0];
                var _y1 = user['compass'][i][1][1];
                for (var j = 2; j < user['compass'][i].length; j++) {
                    var _x2 = user['compass'][i][j][0];
                    var _y2 = user['compass'][i][j][1];
                    draw_solid_line(_x1, _y1, _x2, _y2, user['compass'][i][0]);
                    _x1 = _x2;
                    _y1 = _y2;
                }
            }
        }

        // Restore user ruler
        if (user['ruler'].length > 0) {
            var _ox = user['ruler'][0];
            var _oy = user['ruler'][1];
            var _x1 = user['ruler'][2];
            var _y1 = user['ruler'][3];

            var _rad = Math.atan2(_y1 - _oy, _x1 - _ox);

            context.save();
            context.translate(_ox, _oy);
            context.rotate(_rad);
            context.drawImage(img_ruler, 0, 0);
            context.restore();
        }

        // Restore user protractor
        if (user['protr'].length > 0) {
            var _x0 = user['protr'][0];
            var _y0 = user['protr'][1];
            var _x1 = user['protr'][2];
            var _y1 = user['protr'][3];
            var _ox = (_x0 + _x1) / 2;
            var _oy = (_y0 + _y1) / 2;

            var _rad = Math.atan2(_y1 - _oy, _x1 - _ox);

            context.save();
            context.translate(_ox, _oy);
            context.rotate(_rad);
            context.drawImage(img_protractor, -136, -137);
            context.restore();
        }

        // Restore user select box
        if (user['select'].length > 0) {
            draw_select_box(user['select']);
        }

        if (caller != 'create' && caller != 'update') {
            // Restore author cross points
            for (var i = 0; i < author['cross_points'].length; i++) {
                plot_point_cross(author['cross_points'][i][0], author['cross_points'][i][1], author['cross_points'][i][2]);
            }

            // Restore author dot points
            for (var i = 0; i < author['dot_points'].length; i++) {
                plot_point_circle(author['dot_points'][i][0], author['dot_points'][i][1], author['dot_points'][i][2]);
            }

            // Restore author labels
            for (var i = 0; i < author['labels'].length; i++) {
                write_label(author['labels'][i][0], author['labels'][i][1], author['labels'][i][2], author['labels'][i][3]);
            }

            // Restore author solid lines
            for (var i = 0; i < author['solid_lines'].length; i++) {
                draw_solid_line(author['solid_lines'][i][0], author['solid_lines'][i][1], author['solid_lines'][i][2], author['solid_lines'][i][3], author['solid_lines'][i][4]);
            }

            // Restore author dashed lines
            for (var i = 0; i < author['dashed_lines'].length; i++) {
                draw_dashed_line(author['dashed_lines'][i][0], author['dashed_lines'][i][1], author['dashed_lines'][i][2], author['dashed_lines'][i][3], author['dashed_lines'][i][4]);
            }

            // Restore author heights
            for (var i = 0; i < author['heights'].length; i++) {
                draw_solid_line(author['heights'][i][0], author['heights'][i][1], author['heights'][i][2], author['heights'][i][3], author['heights'][i][16]);
                draw_solid_line(author['heights'][i][4], author['heights'][i][5], author['heights'][i][8], author['heights'][i][9], author['heights'][i][16]);
                draw_solid_line(author['heights'][i][6], author['heights'][i][7], author['heights'][i][8], author['heights'][i][9], author['heights'][i][16]);
            }

            // Restore author circles
            for (var i = 0; i < author['circles'].length; i++) {
                plot_point_circle(author['circles'][i][0], author['circles'][i][1], author['circles'][i][3]);
                draw_arc(author['circles'][i][0], author['circles'][i][1], author['circles'][i][2], 0, 2 * Math.PI, false, author['circles'][i][3]);
            }

            // Restore author compass drawings
            for (var i = 0; i < author['compass'].length; i++) {
                var _x1 = author['compass'][i][0][0];
                var _y1 = author['compass'][i][0][1];
                for (var j = 1; j < author['compass'][i].length; j++) {
                    var _x2 = author['compass'][i][j][0];
                    var _y2 = author['compass'][i][j][1];
                    draw_solid_line(_x1, _y1, _x2, _y2, author['compass'][i][0]);
                    _x1 = _x2;
                    _y1 = _y2;
                }
            }

            // Restore author ruler
            if (author['ruler'].length > 0) {
                context.fillStyle = 'green';

                var _x1 = author['ruler'][0];
                var _y1 = author['ruler'][1];
                var _x2 = author['ruler'][2];
                var _y2 = author['ruler'][3];
                var _x3 = author['ruler'][4];
                var _y3 = author['ruler'][5];
                var _x4 = author['ruler'][6];
                var _y4 = author['ruler'][7];

                // Draw ruler
                draw_solid_line(_x1, _y1, _x2, _y2, 'green');
                draw_solid_line(_x1, _y1, _x3, _y3, 'green');
                draw_solid_line(_x2, _y2, _x4, _y4, 'green');
                draw_solid_line(_x3, _y3, _x4, _y4, 'green');

                // Draw ruler index
                for (var i = 1; i < author_w * 5; i++) {
                    var __x1 = _x1 + (_x2 - _x1) / (5 * author_w) * i;
                    var __y1 = ((__x1 - _x1)/(_x2 - _x1)) * (_y2 - _y1) + _y1;
                    var __x2 = -(__y1 - _y1) / i + __x1;
                    var __y2 = __y1 + (_x2 - _x1) / (5 * author_w);
                    if (i % 5 == 0) {
                        draw_solid_line(__x1, __y1, __x2, __y2);
                        context.fillText(i / 5, 2 * __x2 - __x1, 2 * __y2 - __y1);
                    }
                    else {
                        draw_solid_line(__x1, __y1, (__x1 + __x2)/2, (__y1 + __y2)/2);
                    }
                }
            }

            // Restore author protractor
            if (author['protractor'].length > 0) {
                var _ox = author['protractor'][0];
                var _oy = author['protractor'][1];
                var _x1 = author['protractor'][2];
                var _y1 = author['protractor'][3];

                var _rad = Math.atan2(_y1 - _oy, _x1 - _ox);

                context.save();
                context.translate(_ox, _oy);
                context.rotate(_rad);
                context.drawImage(img_protractor, -136, -137);
                context.restore();
            }
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
            remove_tooltip(DOM.id + '-canvas');
            remove_lock([]);    // Lock all
            if ($.inArray('ruler', types) > -1) user['ruler'] = [];
            if ($.inArray('protr', types) > -1) user['protr'] = [];
        }
        else {
            reset_btn_classname();
            btn.className = 'geo2d-btn-onclick';
            if (types != null) remove_lock(types);
            if (tip != null) tooltip(DOM.id + '-canvas', tip, 'right');
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

    // Tooltip
    function tooltip(id, tip_text, placement) {
        remove_tooltip(id);
        $("#" + id).tooltip({
            // animation: false,
            placement: placement,
            title: tip_text,
            trigger: '',
        });
        $("#" + id).tooltip('show');
    }

    // Toolip remove
    function remove_tooltip(id) {
        $("#" + id).tooltip('destroy');
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
                        JSON.stringify({'ws_id':workspace_id,'delta':JSON.stringify(data_binding())})
                    );
                }
                else {
                    socket.emit(
                        'assigned-group-client-data',
                        JSON.stringify({'g':g,'w':w,'q':q,'ws_id':workspace_id,'delta':JSON.stringify(data_binding())})
                    );
                }
            break;

            case 'practice':
                socket.emit(
                    'practice-client-data',
                    JSON.stringify({'ws_id':workspace_id,'data':JSON.stringify(data_binding())})
                );
            break;

            case 'whiteboard':
                socket.emit(
                    'whiteboard-client-data',
                    JSON.stringify({'ws_id':workspace_id,'data':JSON.stringify(data_binding())})
                );
            break;

            default:
        }
    }

    // Store user data from server (restoration and collaboration)
    function store_data(_user_data) {
        _user_data = JSON.parse(_user_data);
        author_w = _user_data['w'];
        author_h = _user_data['h'];
        interval = _user_data['_'];
        user['cross_points']  = (_user_data['x'] != null)     ? _user_data['x'] : [];
        user['dot_points']    = (_user_data['d'] != null)     ? _user_data['d'] : [];
        user['solid_lines']   = (_user_data['s'] != null)     ? _user_data['s'] : [];
        user['dashed_lines']  = (_user_data['i'] != null)     ? _user_data['i'] : [];
        user['circles']       = (_user_data['o'] != null)     ? _user_data['o'] : [];
        user['compass']       = (_user_data['v'] != null)     ? _user_data['v'] : [];
        user['labels']        = (_user_data['l'] != null)     ? _user_data['l'] : [];
        user['heights']       = (_user_data['hg'] != null)    ? _user_data['hg'] : [];
        user['ruler']         = (_user_data['r'] != null)     ? _user_data['r'] : [];
        user['protr']         = (_user_data['p'] != null)     ? _user_data['p'] : [];
        undo_stack            = (_user_data['u'] != null)     ? _user_data['u'] : [];
    }

    // Bind data to send to server
    function data_binding() {
        var data = {};

        data['w'] = author_w;
        data['h'] = author_h;
        data['_'] = interval;

        user['cross_points'] = strip_removed(user['cross_points']);
        if (user['cross_points'].length > 0) {
            data['x'] = user['cross_points'];
        }
        user['dot_points'] = strip_removed(user['dot_points']);
        if (user['dot_points'].length > 0) {
            data['d'] = user['dot_points'];
        }
        user['solid_lines'] = strip_removed(user['solid_lines']);
        if (user['solid_lines'].length > 0) {
            data['s'] = user['solid_lines'];
        }
        user['dashed_lines'] = strip_removed(user['dashed_lines']);
        if (user['dashed_lines'].length > 0) {
            data['i'] = user['dashed_lines'];
        }
        user['circles'] = strip_removed(user['circles']);
        if (user['circles'].length > 0) {
            data['o'] = user['circles'];
        }
        user['compass'] = strip_removed(user['compass']);
        if (user['compass'].length > 0) {
            data['v'] = user['compass'];
        }
        user['labels'] = strip_removed(user['labels']);
        if (user['labels'].length > 0) {
            data['l'] = user['labels'];
        }
        user['heights'] = strip_removed(user['heights']);
        if (user['heights'].length > 0) {
            data['hg'] = user['heights'];
        }
        // if (undo_stack.length > 0) {
        //  data['u'] = undo_stack;
        // }
        if (user['ruler'].length > 0) {
            data['r'] = user['ruler'];
        }
        if (user['protr'].length > 0) {
            data['p'] = user['protr'];
        }

        return data;
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
            JSON.stringify({'caller':caller,'c':c,'w':w,'q':q,'wo':wb_owner,'ws_id':workspace_id,'delta':action}));
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

    function merge_delta(delta) {
        if (delta.c != null) {
            reset_user_data({});
            obj_list = {};
        }
        else if (delta.u != null) {
            if (obj_list[delta.u[0]] == null)
                obj_list[delta.u[0]] = {};
            obj_list[delta.u[0]][delta.u] = delta.u[2];
            copy_from_objlist_to_user_type(delta.u[0]);
        }
        else if (delta.rt != null) {
            if (obj_list[delta.rt] != null)
                delete obj_list[delta.rt];
            user[delta.rt] = [];
        }
        else if (delta.r != null) {
            if (obj_list[delta.r[0]][delta.r[1]] != null) {
                delete obj_list[delta.r[0]][delta.r[1]];
                copy_from_objlist_to_user_type(delta.r[0]);
            }
        }
        restore_canvas();
    }

    function copy_from_objlist_to_user_type(type) {
        user[type] = [];
        for (var key in obj_list[type]) {
            if (obj_list[type].hasOwnProperty(key)) {
                user[type].push(obj_list[type][key]);
            }
        }
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

    function positionX() {
        var rect = canvas.getBoundingClientRect();
        return (event.pageX - rect.left - $(window).scrollLeft());
    }

    function positionY() {
        var rect = canvas.getBoundingClientRect();
        return (event.pageY - rect.top - $(window).scrollTop());
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
        clear_tooltips: function() {
            remove_tooltip(DOM.id+'-canvas');
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