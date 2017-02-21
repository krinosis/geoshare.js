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
    redo_btn.firstChild.src     = 'src/core/img/redo-passive.png';

    // Transition & del
    user['select']              = [];   // The select box draw by user
    user['trans']               = [];   // The transitions made by users - for undo
    user['del']                 = [];   // The deletions made by user - for undo
    user_redo['trans']          = [];   // The transitions made by users - for redo
    user_redo['del']            = [];   // The deletions made by user - for redo
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