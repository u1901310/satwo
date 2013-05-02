var socket = io.connect('http://localhost:3000/');

/*
* Function to logout
* */
var logout = function() {
    user_logged = null;
    $('#header_buttons').hide();
    $('#main_page').hide();
    $('#room_page').hide();
    $('#game_page').hide();
    $('#chat_zone').hide();
    clear_inputs('login_div');
    $('#init_page').show();

    socket.emit('removeuser', {info: 'sent'});
}