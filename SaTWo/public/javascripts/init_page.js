/**
 * Created with JetBrains WebStorm.
 * User: Eddard
 * Date: 4/04/13
 * Time: 18:24
 * To change this template use File | Settings | File Templates.
 */

///*
// * Function to define the behaviour of the login button
// * */
//var login_button_behaviour = function() {
//    var username = $('#login_user').val();
//    var password = $('#login_pass').val();
//    $.getJSON('login/' + username + '/' + password, function(data) {
//        if(data != null) {
//            $('#init_page').hide();
//            $('#main_page').show();
//        } else {
//            alert("Username or password incorrect");
//        }
//    });
//};
//
///*
// * Function to define the behaviour of the register button
// * */
//var register_button_behaviour = function() {
//    $('#login_div').hide();
//    $('#register_div').show();
//    clear_inputs('login_div');
//};
//
///*
// * Function to define the behaviour of the register cancel button
// * */
//var register_cancel_button_behaviour = function() {
//    remove_tag_by_class('error_register_validation');
//    $('#register_div').hide();
//    $('#login_div').show();
//    clear_inputs('register_div');
//};
//
///*
// * Function to define the behaviour of the register submit button
// * */
//var register_submit_button_behaviour = function() {
//    remove_tag_by_class('error_register_validation');
//    if(validate_register()) {
//        $.post('/addUser',
//            {
//                username: $('#reg_user_input').val(),
//                password: $('#reg_pass_input').val(),
//                email: $('#reg_email_input').val()
//            },
//            function(data,status){
//
//            },
//            "json"
//        );
//        $('#register_div').hide();
//        $('#login_div').show();
//        clear_inputs('register_div');
//        alert("User register success");
//    }
//};
//
///*
// * Function to validate register data, return true if everything OK
// * */
//var validate_register = function() {
//    var validation = true;
//    var username = $('#reg_user_input').val();
//    var password = $('#reg_pass_input').val();
//    var password_confirmation = $('#reg_pass_confirm_input').val();
//    var email = $('#reg_email_input').val();
//
//    /*
//     * Username condition:
//     *   1 - can't be blank
//     *   2 - must be unique on db
//     *   3 - only can contain lowercases, uppercases, digits and underscores
//     * */
//    if(username == "") {
//        validation = false;
//        $('#reg_user_input').after('<span class="error_register_validation">*Username can\'t be blank</span>');
//    } else {
//        var username_pattern = /^\w+$/;
//        if(!username_pattern.test(username)) {
//            validation = false;
//            $('#reg_user_input').after('<span class="error_register_validation">*Username only can contains lowercase, uppercase, digits and underscores</span>');
//        } else {
//            if(!validate_uniqueness(username)) {
//                validation = false;
//                $('#reg_user_input').after('<span class="error_register_validation">*Username is already in use</span>');
//            }
//        }
//    }
//
//    /*
//     * Password condition:
//     *   1 - can't be blank
//     *   2 - must contain lowercases, uppercases, digits and it's lenght must be minimus of 6
//     * */
//    if(password == "") {
//        validation = false;
//        $('#reg_pass_input').after('<span class="error_register_validation">*Password can\'t be blank</span>');
//    } else {
//        if(password.length < 6) {
//            validation = false;
//            $('#reg_pass_input').after('<span class="error_register_validation">*Password must contain at least 6 characters</span>');
//        } else {
//            var password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w*$/;
//            if(!password_pattern.test(password)) {
//                validation = false;
//                $('#reg_pass_input').after('<span class="error_register_validation">*Password must contain lowercase, uppercase, digits</span>');
//            }
//        }
//    }
//
//    /*
//     * Password confirmation:
//     *   1 - Password and password confirmation must be equals
//     * */
//    if( (password != password_confirmation) || (password_confirmation == "")) {
//        validation = false;
//        $('#reg_pass_confirm_input').after('<span class="error_register_validation">*Please enter the same password as above</span>');
//    }
//
//    /*
//     * Email confirmation:
//     *   1 - Email can't be blank
//     *   2 - Email must follow the pattern \w+@\w+.\w+
//     * */
//    if(email == "") {
//        validation = false;
//        $('#reg_email_input').after('<span class="error_register_validation">*Email can\'t be blank</span>');
//    } else {
//        var email_pattern = /^\w+@\w+\.\w+$/;
//        if(!email_pattern.test(email)) {
//            validation = false;
//            $('#reg_email_input').after('<span class="error_register_validation">*Incorrect email format</span>');
//        }
//    }
//
//    return validation;
//}
//
//var remove_tag_by_class = function(class_text) {
//    $('.' + class_text).remove();
//}
//
//var validate_uniqueness = function(username) {
//    var res;
//
//    $('#reg_user_input').after('<img class="verificating_username_uniqueness" align="ansmiddle" src="gifs/ajax-loader.gif"/><span class="verificating_username_uniqueness">Checking availability...</span> ');
//    $.ajax({
//        url: 'userByUsername/' + username,
//        type: 'GET',
//        async: false
//    }).done(function(data) {
//            remove_tag_by_class('verificating_username_uniqueness');
//            if(data.result == "ok") {
//                res = false;
//            } else {
//                res = true;
//            }
//        });
//    return res;
//}






//var roundRect = function (x, y, w, h, r) {
//    if (w < 2 * r) r = w / 2;
//    if (h < 2 * r) r = h / 2;
//
//    return new Kinetic.Shape({
//        drawFunc: function (canvas) {
//            var context = canvas.getContext();
//            context.beginPath();
//            context.moveTo(x+r, y);
//            context.arcTo(x+w, y, x+w, y+h, r);
//            context.arcTo(x+w, y+h, x, y+h, r);
//            context.arcTo(x, y+h, x, y, r);
//            context.arcTo(x, y, x+w, y, r);
//            context.closePath();
//            canvas.fillStroke(this);
//        }
//    });
//};
//
//var stage = new Kinetic.Stage({
//    container: 'container',
//    width: 800,
//    height: 600
//});
//
//var layer = new Kinetic.Layer();
//
//var login = new Image();
//login.onload = function() {
//    var login_img = new Kinetic.Image({
//        x: 40,
//        y: 130,
//        image: login,
//        width: login.width * 0.08,
//        height: login.height * 0.08
//    });
//
//    layer.add(login_img);
//    stage.add(layer);
//}
//login.src = './images/login.png';
//
//var background_rect = roundRect(40, 160, 720, 200, 15);
//background_rect.setFill('rgba(149,161,77,0.25)');
//background_rect.setStroke('rgba(149,161,77,0)');
//layer.add(background_rect);
//
//var username = new Image();
//username.onload = function() {
//    var username_img = new Kinetic.Image({
//        x: 150,
//        y: 220,
//        image: username,
//        width: username.width * 0.08,
//        height: username.height * 0.08
//    });
//
//    layer.add(username_img);
//    stage.add(layer);
//}
//username.src = './images/username.png';
//
//var password = new Image();
//password.onload = function() {
//    var password_img = new Kinetic.Image({
//        x: 150,
//        y: 290,
//        image: password,
//        width: password.width * 0.08,
//        height: password.height * 0.08
//    });
//
//    layer.add(password_img);
//    stage.add(layer);
//}
//password.src = './images/password.png';
//
//var register_rect = roundRect(40, 365, 415, 120, 15);
//register_rect.setFill('rgba(0,0,0,0.25)');
//register_rect.setStroke('rgba(0,0,0,0)');
//layer.add(register_rect);
//
//var register_hit_rect = roundRect(40, 365, 415, 120, 15);
//register_hit_rect.on('mouseover', function() {
//    register_rect.setFill('orange');
//    layer.draw();
//    document.body.style.cursor = "pointer";
//});
//register_hit_rect.on('mouseout', function() {
//    register_rect.setFill('rgba(0,0,0,0.25)');
//    layer.draw();
//    document.body.style.cursor = "default";
//});
//register_hit_rect.on('mousedown', function() {
//    register_rect.setFill('green');
//    layer.draw();
//});
//register_hit_rect.on('mouseup', function() {
//    register_rect.setFill('orange');
//    layer.draw();
//});
//
//register_hit_rect.on('click', function() {
//    register_rect.hide();
//});
//
//var register = new Image();
//register.onload = function() {
//    var register_img = new Kinetic.Image({
//        x: 75,
//        y: 375,
//        image: register,
//        width: register.width * 0.2,
//        height: register.height * 0.2
//    });
//
//    layer.add(register_img);
//    layer.add(register_hit_rect);
//    stage.add(layer);
//}
//register.src = './images/register_black.png';
//
//var enter_rect = roundRect(460, 365, 300, 120, 15);
//enter_rect.setFill('rgba(79,98,40,0.4)');
//enter_rect.setStroke('rgba(79,98,40,0)');
//layer.add(enter_rect);
//
//var enter_hit_rect = roundRect(460, 365, 300, 120, 15);
//enter_hit_rect.on('mouseover', function() {
//    enter_rect.setFill('orange');
//    layer.draw();
//    document.body.style.cursor = "pointer";
//});
//enter_hit_rect.on('mouseout', function() {
//    enter_rect.setFill('rgba(79,98,40,0.4)');
//    layer.draw();
//    document.body.style.cursor = "default";
//});
//enter_hit_rect.on('mousedown', function() {
//    enter_rect.setFill('green');
//    layer.draw();
//});
//enter_hit_rect.on('mouseup', function() {
//    enter_rect.setFill('orange');
//    layer.draw();
//});
//
//enter_hit_rect.on('click', function() {
//    login_button_behaviour();
//});
//
//var enter = new Image();
//enter.onload = function() {
//    var enter_img = new Kinetic.Image({
//        x: 500,
//        y: 375,
//        image: enter,
//        width: enter.width * 0.2,
//        height: enter.height * 0.2
//    });
//
//    layer.add(enter_img);
//    layer.add(enter_hit_rect);
//    stage.add(layer);
//}
//enter.src = './images/enter.png';
//
//stage.add(layer);







/*
 * Function to define the behaviour of the login button
 * */
var login_button_behaviour = function() {
    var username = $('#login_user').val();
    var password = $('#login_pass').val();
    var info = $.getJSON('login/' + username + '/' + password, function(data) {
        if(data != null) {
            user = data;
            $('#init_page').hide();
            $('#main_page').show();
            $('#main_page').load('html/main_page.html');
        } else {
            alert("Username or password incorrect");
        }
    });
};

/*
 * Function to define the behaviour of the register button
 * */
var register_button_behaviour = function() {
    $('#login_div').hide();
    $('#register_div').show();
    clear_inputs('login_div');
};

/*
 * Function to define the behaviour of the register cancel button
 * */
var register_cancel_button_behaviour = function() {
    remove_tag_by_class('error_register_validation');
    $('#register_div').hide();
    $('#login_div').show();
    clear_inputs('register_div');
};

/*
 * Function to define the behaviour of the register submit button
 * */
var register_submit_button_behaviour = function() {
    remove_tag_by_class('error_register_validation');
    if(validate_register()) {
        $.post('/addUser',
            {
                username: $('#reg_user_input').val(),
                password: $('#reg_pass_input').val(),
                email: $('#reg_email_input').val()
            },
            function(data,status){

            },
            "json"
        );
        $('#register_div').hide();
        $('#login_div').show();
        clear_inputs('register_div');
        alert("User register success");
    }
};

/*
 * Function to validate register data, return true if everything OK
 * */
var validate_register = function() {
    var validation = true;
    var username = $('#reg_user_input').val();
    var password = $('#reg_pass_input').val();
    var password_confirmation = $('#reg_pass_confirm_input').val();
    var email = $('#reg_email_input').val();

    /*
     * Username condition:
     *   1 - can't be blank
     *   2 - must be unique on db
     *   3 - only can contain lowercases, uppercases, digits and underscores
     * */
    if(username == "") {
        validation = false;
        $('#reg_user_input').after('<span class="error_register_validation">*Username can\'t be blank</span>');
    } else {
        var username_pattern = /^\w+$/;
        if(!username_pattern.test(username)) {
            validation = false;
            $('#reg_user_input').after('<span class="error_register_validation">*Username only can contains lowercase, uppercase, digits and underscores</span>');
        } else {
            if(!validate_uniqueness(username)) {
                validation = false;
                $('#reg_user_input').after('<span class="error_register_validation">*Username is already in use</span>');
            }
        }
    }

    /*
     * Password condition:
     *   1 - can't be blank
     *   2 - must contain lowercases, uppercases, digits and it's lenght must be minimus of 6
     * */
    if(password == "") {
        validation = false;
        $('#reg_pass_input').after('<span class="error_register_validation">*Password can\'t be blank</span>');
    } else {
        if(password.length < 6) {
            validation = false;
            $('#reg_pass_input').after('<span class="error_register_validation">*Password must contain at least 6 characters</span>');
        } else {
            var password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w*$/;
            if(!password_pattern.test(password)) {
                validation = false;
                $('#reg_pass_input').after('<span class="error_register_validation">*Password must contain lowercase, uppercase, digits</span>');
            }
        }
    }

    /*
     * Password confirmation:
     *   1 - Password and password confirmation must be equals
     * */
    if( (password != password_confirmation) || (password_confirmation == "")) {
        validation = false;
        $('#reg_pass_confirm_input').after('<span class="error_register_validation">*Please enter the same password as above</span>');
    }

    /*
     * Email confirmation:
     *   1 - Email can't be blank
     *   2 - Email must follow the pattern \w+@\w+.\w+
     * */
    if(email == "") {
        validation = false;
        $('#reg_email_input').after('<span class="error_register_validation">*Email can\'t be blank</span>');
    } else {
        var email_pattern = /^\w+@\w+\.\w+$/;
        if(!email_pattern.test(email)) {
            validation = false;
            $('#reg_email_input').after('<span class="error_register_validation">*Incorrect email format</span>');
        }
    }

    return validation;
}

var remove_tag_by_class = function(class_text) {
    $('.' + class_text).remove();
}

var validate_uniqueness = function(username) {
    var res;

    $('#reg_user_input').after('<img class="verificating_username_uniqueness" align="ansmiddle" src="gifs/ajax-loader.gif"/><span class="verificating_username_uniqueness">Checking availability...</span> ');
    $.ajax({
        url: 'userByUsername/' + username,
        type: 'GET',
        async: false
    }).done(function(data) {
            remove_tag_by_class('verificating_username_uniqueness');
            if(data.result == "ok") {
                res = false;
            } else {
                res = true;
            }
        });
    return res;
}