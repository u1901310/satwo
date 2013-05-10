
var socket = io.connect('http://localhost:3000/');

$(document).ready(function() {
    $.getJSON('/getGame/' + current_game_id, function(game) {
       $('#Room_name_div').text("Room of " + game.game_name);
       print_room_buttons(game);
    });
    print_room_user_info();
    print_room_list_users();

    $('#chat_zone').removeClass('chat_game').addClass('chat_room'); //Alerta per si no funciona al no tenir class chat_game!!!
    $('#chat_zone').show();
    $('#chat_zone').load('html/chat_zone.html');

    //A user has enter to the game, everyone in the game, except the user who just enter reprint the list
    socket.on('enter_game_received', function (data) {
        if(current_game_id == data.info1 && user_logged._id != data.info2) {
            print_room_list_users();
        }
    });

    //A user confirmed his participation to the game, data: {info: game_id whom user confirm}
    socket.on('room_user_confirmation_received', function(data) {
        if(current_game_id == data.info) {
            print_room_list_users();
        }
    });

    //A user leave the room and it could be the room_admin so new admin, data: {info: game_id}
    socket.on('room_leave_received', function(data) {
        if(current_game_id == data.info) {
            print_room_list_users();
            $.getJSON('/getGame/' + current_game_id, function(game) {
                print_room_buttons(game);
            });
        }
    });

    //A user it's been expeled of a game, data: {info1: from whom 'game_id' it's been expeled, info2: whom 'user_id' it's been expeled}
    socket.on('room_user_expelled_received', function(data) {
        if(user_logged._id == data.info2) {
            $('#chat_zone').hide();
            $('#room_page').hide();
            $('#main_page').show();
            $('#main_page').load('html/main_page.html');
        } else {
            if(current_game_id == data.info1) {
                print_room_list_users();
            }
        }
    });

    socket.on('start_game_received', function (data) {
        if (current_game_id == data.info) {
            $('#chat_zone').removeClass('chat_room').addClass('chat_game');
            $('#room_page').hide();
            $('#game_page').show();
            $('#game_page').load('html/game_page.html');
        }
    });
});

/*
* Function to print the input schedule for the user
*  params: - (it uses the user_logged of init_page)
* */
function print_room_user_info() {
    $('#Room_player_div').empty();
    $.getJSON('/getFactions', function(factions) {
        $('#Room_player_div').append('<span id="Room_player_name">' + user_logged.user_username + '</span>');
        $('#Room_player_div').append('<select id="Room_faction_selector"></select>');
        var i;
        for(i = 0; i < factions.length; i++) {
            $('#Room_faction_selector').append('<option value="' + factions[i].faction_name + '">' + factions[i].faction_name + '</option>');
        }
        $('#Room_player_div').append('<input id="Room_invite_friend_button" type="button" value="INVITE FRIEND" onclick="javascript:invite_friend_button_behaviour()"/>');
    });
};

/*
* Function to print the list of users in the room
*  params: - (it uses the current_game_id of main_page)
* */
function print_room_list_users() {
    $('#Room_list_player_div').empty();
    $.getJSON('/getGame/' + current_game_id, function(game) {
        for(var i = 0; i < game.game_num_of_players; i++) {
            if( i < game.game_current_num_of_players) {
                var user_id = game.game_users_info[i].user_id;
                var user_confirmed = game.game_users_info[i].confirmation;
                var user_faction = game.game_users_info[i].faction; //If user is confirmed then faction!= null
                //$.getJSON('/getUserUsername/' + user_id, function(username) {
                $.ajax({
                    url: 'getUserUsername/' + user_id,
                    type: 'GET',
                    async: false
                }).done(function(username) {
                        if(user_logged._id == game.game_room_administrator) { //If user is room admin, it has privileges
                            if(user_logged._id == user_id) { //Don't need privileges for himself
                                if(user_confirmed) {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmed">Confirmed</span><span class="Room_list_faction">' + user_faction + '</span></p>');
                                } else {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_unconfirmed">Waiting for confirmation</span></p>');
                                }
                            } else { //Privileges to expel other users
                                if(user_confirmed) {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmed">Confirmed</span><span class="Room_list_faction">' + user_faction + '</span><input class="Room_list_expel_button" type="button" value="EXPEL" onclick="javascript:expel_button_behaviour(\'' + user_id + '\')"/></p>');
                                } else {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_unconfirmed">Waiting for confirmation</span><input class="Room_list_expel_button" type="button" value="EXPEL" onclick="javascript:expel_button_behaviour(\'' + user_id + '\')"/></p>');
                                }
                            }
                        } else { //Other users don't have privileges
                            if(user_confirmed) {
                                $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmed">Confirmed</span><span class="Room_list_faction">' + user_faction + '</span></p>');
                            } else {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_unconfirmed">Waiting for confirmation</span></p>');
                            }
                        }
                });
                //});
            } else {
                $('#Room_list_player_div').append('<p><span class="Room_list_no_user">\< Empty Slot \></span></p>');
            }
        }
    });
};

/*
* Function to print the option buttons of the user, if user is room admin it have to start the game
*  params: game (to evaluate if user_logged is room admin
* */
//var print_room_buttons = function(game) {
function print_room_buttons(game) {
    $('#Room_buttons_div').empty();
    if(user_logged._id == game.game_room_administrator) {
        $('#Room_buttons_div').append('<input id="Room_start_button" type="button" value="Start" onclick="javascript:start_button_behaviour()"/>');
    }
    var find = false;
    var i = 0;
    while(!find) {
        if(game.game_users_info[i].user_id == user_logged._id) {
            find = true;
            if(!game.game_users_info[i].confirmation) {
                $('#Room_buttons_div').append('<input id="Room_confirm_button" type="button" value="Confirm" onclick="javascript:confirm_button_behaviour(\'' + user_logged._id + '\')"/>');
            }
        }
        i++;
    }
    $('#Room_buttons_div').append('<input id="Room_leave_button" type="button" value="Leave" onclick="javascript:leave_button_behaviour(\'' + user_logged._id + '\')"/>');
};

/*
* Function to confirm the participation of the user in the game
*  params: user_id (also it uses the current_game_id)
* */
var confirm_button_behaviour = function(user_id) {
    $.ajax({
        url: 'confirmUserToGame',
        type: 'POST',
        data: {
                user_id: user_id,
                game_id: current_game_id,
                user_faction: $('#Room_faction_selector').val()
              },
        async: false
    }).done(function() {
            socket.emit('room_user_confirmation_sent', {info: current_game_id});
            //Enviar peticio per repintar el llistat de tots els participants de la sala (poder s'haura de fer directament des de el servidor...)
            $('#Room_confirm_button').hide();
        });
    /*$.post('confirmUserToGame',
        {
            user_id: user_id,
            game_id: current_game_id,
            user_faction: $('#Room_faction_selector').val()
        },
        function() {
            alert("return from confirmUserToGame");
            socket.emit('game_user_confirmation_sent', {info: current_game_id});
            //Enviar peticio per repintar el llistat de tots els participants de la sala (poder s'haura de fer directament des de el servidor...)
            $('#Room_confirm_button').hide();
        },
        "json"
    );*/
};

/*
* Function to leave the game
*  params: user_id (also it uses the curret_game_id)
* */
var leave_button_behaviour = function(user_id) {
    $.ajax({
        url: 'unlinkGameAndUser',
        type: 'POST',
        data: {
            user_id: user_id,
            game_id: current_game_id
        },
        async:false
    }).done(function() {
            //Enviar peticio per repintar el llista de tots els participants de la sala (poder s'haura de fer directament des de el servidor...)
            alert("Exit from the room");
            $('#chat_zone').hide();
            $('#room_page').hide();
            $('#main_page').show();
            $('#main_page').load('html/main_page.html');

            socket.emit('new_game_sent', {info: 'sent'});
            socket.emit('room_leave_sent', {info: current_game_id});
            socket.emit('removeuser', {info: 'sent'});
    });
    /*$.post('unlinkGameAndUser',
        {
            user_id: user_id,
            game_id: current_game_id
        },
        function() {
            //Enviar peticio per repintar el llista de tots els participants de la sala (poder s'haura de fer directament des de el servidor...)
            alert("Exit from the room");
            $('#room_page').hide();
            $('#main_page').show();
            $('#main_page').load('html/main_page.html');
        },
        "json"
    );*/
};

/*
 * Function to expel a user of the game (only for room administrators)
 *  params: user_id (also it uses the curret_game_id)
 * */
var expel_button_behaviour = function(user_id) {
    $.ajax({
        url: 'unlinkGameAndUser',
        type: 'POST',
        data: {
            user_id: user_id,
            game_id: current_game_id
        },
        async:false
    }).done(function() {
            alert("User: " + user_id + " expelled");
            socket.emit('room_user_expelled_sent', {info1: current_game_id, info2: user_id});
            //socket.emit('enter_game_sent', {info: 'sent'});
            socket.emit('removeuser', {info: 'sent'});
        });
};

/*
* Function to start the current game, to start the game can't be any slot empty and all users have to confirm their participation
*  params: - (it usesthe current_game_id)
* */
var start_button_behaviour = function() {
    $.getJSON('/getGame/' + current_game_id, function(game) {
        if (game.game_num_of_players == game.game_current_num_of_players) {
            var not_confirmed = false;
            $.each(game.game_users_info, function() {
                if (!this.confirmation) not_confirmed = true;
            });
            if (!not_confirmed) {
                // Initialize the game
                $.post('/initGame',
                    {
                        id: current_game_id
                    },
                    function(data, status){

                    },
                    "json"
                );

                socket.emit('start_game_sent', {game_id: game._id});
            }
            else {
                alert("There are some players who have not confirmed yet");
            }
        }
        else {
            alert("There aren't enough players");
        }
    });
};