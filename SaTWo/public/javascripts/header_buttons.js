/**
 * Created with JetBrains WebStorm.
 * User: Eddard
 * Date: 12/04/13
 * Time: 12:50
 * To change this template use File | Settings | File Templates.
 */

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