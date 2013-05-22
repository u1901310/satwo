
var user_logged = null;
var current_game_id = null;
var main_page_loaded = false;
var room_page_loaded = false;
var game_page_loaded = false;
var chat_zone_loaded = false;

$(document).ready(function() {
    // Clean all possible information in inputs fields
    clear_inputs('login_div');
    clear_inputs('register_div');

    //Session params
    //var user_logged = null;
    //var current_game_id = null;
});

/*
 * Function to clean every input tag from a div
 * */
var clear_inputs = function(id) {
    $('#' + id + ' input').each(function () {
        if ($(this).is("input")) {
            switch (this.type) {
                case 'password':
                case 'select-multiple':
                case 'select-one':
                case 'email':
                case 'text':
                case 'textarea':
                    $(this).val('');
                    break;
                case 'checkbox':
                case 'radio':
                    this.checked = false;
            }
        }
    });
};