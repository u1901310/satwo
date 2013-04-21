
/*
* Function to logout
* */
var logout = function() {
    user_logged = null;
    $('#header_buttons').hide();
    $('#main_page').hide();
    $('#room_page').hide();
    $('#game_page').hide();
    clear_inputs('login_div');
    $('#init_page').show();
}