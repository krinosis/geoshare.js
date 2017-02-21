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

function positionX() {
    var rect = canvas.getBoundingClientRect();
    return (event.pageX - rect.left - $(window).scrollLeft());
}

function positionY() {
    var rect = canvas.getBoundingClientRect();
    return (event.pageY - rect.top - $(window).scrollTop());
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