var socket = io.connect('http://localhost:3000');
var usernames = {};

socket.emit('subscribe', current_game_id, user_logged.user_username);

socket.on('userconnected', function(username) {
    usernames[username] = username;

    $('#conversation').append('<b>SERVER:</b> ' + username + ' has connected<br>');

    $('#users').empty();
    $.each(usernames, function(key, value) {
        $('#users').append('<div>' + key + '</div>');
    });
});

socket.on('userdisconnected', function(username) {
    delete usernames[username];
    $('#conversation').append('<b>SERVER:</b> ' + username + ' has disconnected<br>');

    $('#users').empty();
    $.each(usernames, function(key, value) {
        $('#users').append('<div>' + key + '</div>');
    });
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    $('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
});

// on load of page
$(function(){
    $('#users').empty();
    $.getJSON('/getGame/' + current_game_id, function(game) {
        $.each(game.game_users_info, function(){
            var user_id = this.user_id;
            $.ajax({
                url: 'getUserUsername/' + user_id,
                type: 'GET',
                async: false
            }).done(function(username){
                usernames[username] = username;
                $('#users').append('<div>' + username + '</div>');
            });
        });
    });

    // when the client clicks SEND
    $('#datasend').click(function() {
        var message = $('#data').val();
        $('#data').val('');
        $('#data').focus();

        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', message);
    });

    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
        if (e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
});