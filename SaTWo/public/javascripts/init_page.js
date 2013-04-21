/*
 * Function to define the behaviour of the login button
 * */
var login_button_behaviour = function() {
    var username = $('#login_user').val();
    var password = $('#login_pass').val();
    $.getJSON('login/' + username + '/' + password, function(data) {
        if(data.result == 'ok') {
            $('#init_page').hide();
            $('#main_page').show();
            $('#main_page').load('html/main_page.html');
            user_logged = data;
            $('#header_username_holder').text(user_logged.user_username);
            $('#header_buttons').show();
            $('#header_buttons').load('html/header_buttons.html');
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
};

/*
 * Function to remove every tag from a certain class
 * */
var remove_tag_by_class = function(class_text) {
    $('.' + class_text).remove();
};

/*
 * Function to validate the uniqueness of a username asynchronously.
 * */
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
};