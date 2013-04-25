
$(document).ready(function() {
    $.getJSON('/getGame/' + current_game_id, function(game) {
       $('#Room_name_div').text("Room of " + game.game_name);
       print_room_buttons(game);
    });
    print_room_user_info();
    print_room_list_users();
});

/*
* Function to print the input schedule for the user
*  params: - (it uses the user_logged of init_page)
* */
function print_room_user_info() {
    $('#Room_player_div').empty();
    $.getJSON('/getFactions', function(factions) {
        $('#Room_player_div').append('<span>' + user_logged.user_username + '</span>');
        $('#Room_player_div').append('<select id="Room_faction_selector"></select>');
        var i;
        for(i = 0; i < factions.length; i++) {
            $('#Room_faction_selector').append('<option value="' + factions[i].faction_name + '">' + factions[i].faction_name + '</option>');
        }
        $('#Room_player_div').append('<input type="button" value="INVITE FRIEND" onclick="javascript:invite_friend_button_behaviour()"/>');
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
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmation">Confirmed</span><span class="Room_list_faction">' + user_faction + '</span></p>');
                                } else {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmation">Waiting for confirmation</span></p>');
                                }
                            } else { //Privileges to expel other users
                                if(user_confirmed) {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmation">Confirmed</span><span class="Room_list_faction">' + user_faction + '</span><input type="button" value="EXPEL" onclick="javascript:expel_button_behaviour(\'' + user_id + '\')"/></p>');
                                } else {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmation">Waiting for confirmation</span><input type="button" value="EXPEL" onclick="javascript:expel_button_behaviour(\'' + user_id + '\')"/></p>');
                                }
                            }
                        } else { //Other users don't have privileges
                            if(user_confirmed) {
                                $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmation">Confirmed</span><span class="Room_list_faction">' + user_faction + '</span></p>');
                            } else {
                                    $('#Room_list_player_div').append('<p><span class="Room_list_username">' + username + '</span><span class="Room_list_confirmation">Waiting for confirmation</span></p>');
                            }
                        }
                });
                //});
            } else {
                $('#Room_list_player_div').append('<p>\< Empty Slot \></p>');
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
        $('#Room_buttons_div').append('<input type="button" value="Start" onclick="javascript:start_button_behaviour()"/>');
    }
    $('#Room_buttons_div').append('<input id="Room_confirm_button" type="button" value="Confirm" onclick="javascript:confirm_button_behaviour(\'' + user_logged._id + '\')"/>');
    $('#Room_buttons_div').append('<input type="button" value="Leave" onclick="javascript:leave_button_behaviour(\'' + user_logged._id + '\')"/>');
};

/*
* Function to confirm the participation of the user in the game
*  params: user_id (also it uses the current_game_id)
* */
var confirm_button_behaviour = function(user_id) {
    $.post('confirmUserToGame',
        {
            user_id: user_id,
            game_id: current_game_id,
            user_faction: $('#Room_faction_selector').val()
        },
        function() {
            //Enviar peticio per repintar el llistat de tots els participants de la sala (poder s'haura de fer directament des de el servidor...)
            $('#Room_confirm_button').hide();
        },
        "json"
    );
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
            $('#room_page').hide();
            $('#main_page').show();
            $('#main_page').load('html/main_page.html');
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
* Function to start the current game, to start the game can't be any slot empty and all users have to confirm their participation
*  params: - (it usesthe current_game_id)
* */
var start_button_behaviour = function() {

};