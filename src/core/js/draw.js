// Cross point down / cross down
function cross_down(event) {
    var _x = positionX();
    var _y = positionY();
    plot_point_cross(_x, _y, color);
    user['cross_points'].push([_x, _y, color]);
    undo_stack.push('cross_points');
    modify = true;
    undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
    undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
    undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
        undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
        undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
            undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
    undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
    undo_btn.firstChild.src = 'src/core/img/undo-active.png';
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
            }
            else if (length_line(_x, _y, x1, y2) < _thres) {
                canvas.style.cursor = 'alias';
                highlight_point(x1, y2, _thres);
            }
            else if (length_line(_x, _y, x2, y1) < _thres) {
                canvas.style.cursor = 'alias';
                highlight_point(x2, y1, _thres);
            }
            else if (length_line(_x, _y, x2, y2) < _thres) {
                canvas.style.cursor = 'alias';
                highlight_point(x2, y2, _thres);
            }
            // Searching for the location of flipping
            else if (length_line(_x, _y, x1, (y1 + y2)/2) < _thres) {
                canvas.style.cursor = 'e-resize';
                highlight_point(x1, (y1 + y2)/2, _thres);
            }
            else if (length_line(_x, _y, (x1 + x2)/2, y1) < _thres) {
                canvas.style.cursor = 'n-resize';
                highlight_point((x1 + x2)/2, y1, _thres);
            }
            else if (length_line(_x, _y, x2, (y1 + y2)/2) < _thres) {
                canvas.style.cursor = 'e-resize';
                highlight_point(x2, (y1 + y2)/2, _thres);
            }
            else if (length_line(_x, _y, (x1 + x2)/2, y2) < _thres) {
                canvas.style.cursor = 'n-resize';
                highlight_point((x1 + x2)/2, y2, _thres);
            }
            // Searching for the location of dragging
            else if (x1 <= _x && _x <= x2 && y1 <= _y && _y <= y2) {
                canvas.style.cursor = 'move';
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
        del_btn.firstChild.src = 'src/core/img/del-active.png';
        copy_btn.firstChild.src = 'src/core/img/copy-active.png';
    }
    else {
        locks['del'] = locks['copy'] = true;
        del_btn.firstChild.src = 'src/core/img/del-passive.png';
        copy_btn.firstChild.src = 'src/core/img/copy-passive.png';
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
