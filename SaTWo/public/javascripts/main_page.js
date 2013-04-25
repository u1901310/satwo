
//TODO: Recarregar les sol·licituds i amics automàticament quan s'afegeixen
$(document).ready(function() {
    list_user_games();
    reload_requests();
    reload_friends();
});


var add_friend_button_behaviour = function(){
    if (user_logged.user_username != $('#friend_username').val()) {
        var info = $.getJSON('userByUsername/' + $('#friend_username').val(), function(data) {
            if(data.result == "ok") {
                $.post('/sendRequest',
                    {
                        user: user_logged.user_username,
                        friend: $('#friend_username').val()
                    },
                    function(data,status){

                    },
                    "json"
                );
            } else {
                alert("This user does not exist");
            }
        });
    } else {
        alert("You can't add yourself as a friend");
    }
};

function reload_requests(){
    $('#requests_list').empty();

    var info = $.getJSON('getRequests/' + user_logged.user_username, function(data) {
        if(data.result == 'ok') {
            $.each(data.requests, function(){
                $('#requests_list').append(
                    '<div class="request_item">' +
                    '   <span>' + this + '</span>' +
                    '   <input class="button_accept_request" type="button" value="V" ' +
                    '       onclick="javascript:accept_request_button_behaviour(\'' + this + '\')"/>' +
                    '   <input class="button_reject_request" type="button" value="X" ' +
                    '       onclick="javascript:reject_request_button_behaviour(\'' + this + '\')"/>' +
                    '</div>'
                );
            });
        }
    });
};

function reload_friends(){
    $('#friends_list').empty();

    var info = $.getJSON('getFriends/' + user_logged.user_username, function(data) {
        if(data.result == 'ok') {
            $.each(data.friends, function(){
                $('#friends_list').append(
                    '<div class="friend_item">' +
                    '   <span>' + this + '</span>' +
                    '   <input class="button_remove_friend" type="button" value="X" ' +
                    '       onclick="javascript:remove_friend_button_behaviour(\'' + this + '\')"/>' +
                    '</div>'
                );
            });
        }
    });
};

var remove_friend_button_behaviour = function(name){
    var ok = confirm("Remove friend: " + name + "?");
    if (ok) {
        $.post('/removeFriend',
            {
                user: user_logged.user_username,
                friend: name
            },
            function(data,status){

            },
            "json"
        );

        reload_friends();
    }
};

var accept_request_button_behaviour = function(name){
    if (user_logged.user_username != name) {
        var info = $.getJSON('userByUsername/' + name, function(data) {
            if(data.result == "ok") {
                $.post('/addFriend',
                    {
                        user: user_logged.user_username,
                        friend: name
                    },
                    function(data,status){

                    },
                    "json"
                );

                reload_requests();
                reload_friends();
            } else {
                alert("This user does not exist");
            }
        });
    } else {
        alert("You can't add yourself as a friend");
    }
};

var reject_request_button_behaviour = function(name){
    $.post('/rejectRequest',
        {
            user: user_logged.user_username,
            friend: name
        },
        function(data,status){

        },
        "json"
    );

    reload_requests();
};

/*
* Function to define the behaviour of the own games button
* */
var own_games_button_behaviuour = function() {
    $('#public_games_list').hide();
    $('#new_game_info').hide();
    $('#my_games_list').show();
    list_user_games();
    //Resaltar el boto per remarcar que hem apretat
};

/*
* Function to get all games of the user and show them
* */
function list_user_games() {
    $('#my_games_list').empty();
    $.ajax({
        url: 'userGames/' + user_logged._id,
        type: 'GET',
        async: false
    }).done(function(data) {
            if(data.result == 'ok') {
                $.each(data.games_list, function() {
                    $('#my_games_list').append(
                        '<span>' + this.game_name + ' ' + this.game_current_num_of_players + '/' + this.game_num_of_players + '<input class="continue_game_button" type="button" value="Continue" onclick="javascript:continue_game_button_behaviour(\'' + this._id + '\')"/> </span>' +
                            '<br>'
                    );
                });
            } else {
                $('#my_games_list').append('<p>Sorry, no games found</p>');
            }
        });
};

/*
 * Function to define the behaviour of the public games button
 * */
var public_games_button_behaviuour = function() {
    $('#my_games_list').hide();
    $('#new_game_info').hide();
    $('#public_games_list').show();
    list_public_games();
    //Resaltar el boto per remarcar que hem apretat
};

/*
 * Function to get all public games and show them
 * */
var list_public_games = function() {
    $('#public_games_list').empty();
    $.ajax({
        url: '/publicGames',
        type: 'GET',
        async: false
    }).done(function(data) {
            if(data.result == 'ok') {
                $.each(data.games_list, function() {
                    if(this.game_password != "") {
                        $('#public_games_list').append(
                            '<span>' + this.game_name + ' ' + this.game_current_num_of_players + '/' + this.game_num_of_players + '<img src="/images/lock_key.png" alt="this game need a password"> <input class="enter_game_button" type="button" value="Enter" onclick="javascript:enter_game_button_behaviour(\'' + this._id + '\')"/> </span>' +
                            '<br>'
                        );
                    }else {
                        $('#public_games_list').append(
                            '<span>' + this.game_name + ' ' + this.game_current_num_of_players + '/' + this.game_num_of_players + '<input class="enter_game_button" type="button" value="Enter" onclick="javascript:enter_game_button_behaviour(\'' + this._id + '\')"/> </span>' +
                            '<br>'
                        );
                    }
                });
            } else {
                $('#public_games_list').append('<p>Sorry, no games found</p>');
            }
        });
};

/*
 * Function to define the behaviour of the new game button
 * */
var new_game_button_behaviuour = function() {
    clear_inputs('new_game_info');
    $('#my_games_list').hide();
    $('#public_games_list').hide();
    $('#new_game_info').show();
};

/*
 * Function to define the behaviour of the new game submit button
 * */
var submit_new_game_button_behaviour = function() {
    var game_created_id;
    $('.error_new_game_validation').remove();
    if(validate_game()) {
        //Petition to create a new game
        $.ajax({
            url: 'addGame/',
            type: 'POST',
            data: {
                name: $('#game_name_input').val(),
                password: $('#game_pass_input').val(),
                n_players: $('#game_players_number_input').val(),
                user_creator: user_logged._id
            },
            async: false
        }).done(function(data) {
                game_created_id = data._id;

                //Petition to link the creator user with the created game
                $.post('/addGameToUser',
                    {
                        user: user_logged._id,
                        game: game_created_id
                    },
                    function(data, status){

                    },
                    "json"
                );
            });


        $('#new_game_info').hide();
        //Redirigir a la sala en canvi de mostrar de nou el llistat
        current_game_id = game_created_id;
        $('#main_page').hide();
        $('#room_page').show();
        $('#room_page').load('html/room_page.html');
        //own_games_button_behaviuour();
        alert("Game created");
    }
};

/*
 * Function to validate register data, return true if everything OK
 * */
var validate_game = function() {
    var validation = true;
    var name = $('#game_name_input').val();
    var n_players = $('#game_players_number_input').val();

    /*
     * Name condition:
     *   1 - can't be blank
     *   2 - only can contain lowercases, uppercases, digits and underscores
     * */
    if(name == "") {
        validation = false;
        $('#game_name_input').after('<span class="error_new_game_validation">*Name can\'t be blank</span>');
    } else {
        var username_pattern = /^(\w|\s)+$/;
        if(!username_pattern.test(name)) {
            validation = false;
            $('#game_name_input').after('<span class="error_new_game_validation">*Name only can contains lowercase, uppercase, digits and underscores</span>');
        }
    }
    /*
    * Nº of player condition:
    *   1 - Must be between 2 and 6
    * */
    if(n_players < 2) {
        //validation = false;
        //$('#game_players_number_input').after('<span class="error_new_game_validation">*Number of players have to be greater than 2</span>');
        $('#game_players_number_input').val(2);
    }
    if(n_players > 6) {
        //validation = false;
        //$('#game_players_number_input').after('<span class="error_new_game_validation">*Number of players have to be lower than 6</span>');
        $('#game_players_number_input').val(6);
    }
    return validation;
};

/*
 * Function to define the behaviour of the new game cancel button
 * */
var cancel_new_game_button_behaviour = function() {
    $('#new_game_info').hide();
    own_games_button_behaviuour();
};

/*
 * Function to define the behaviour of the enter game button
 * */
var enter_game_button_behaviour = function(game_id) {
    current_game_id = game_id;
    $.getJSON('/gameIsFull/' + game_id, function(data) {
        if(data.result == 'yes') {
            alert("Game is Full");
        } else {
            $.getJSON('/gameIsSecure/' + game_id, function(data) {
                if(data.result == 'yes') {
                    $('#Game_management_div').hide();
                    $('#access_secure_games_div').show();
                } else {
                    $.post('/linkGameAndUser',
                        {
                            user: user_logged._id,
                            game: game_id
                        },
                        function(data, status){},
                        "json"
                    );
                    $('#main_page').hide();
                    $('#room_page').show();
                    $('#room_page').load('html/room_page.html');
                }
            });
        }
    });
};

/*
 * Function to define the behaviour of the continue game button
 * */
var continue_game_button_behaviour = function() {

};

/*
* Function to access a secure game
* */
var access_secure_game = function() {
    $('.error_access_secure_game').remove();
    $.post('/validateGamePassword',
        {
            game_id: current_game_id,
            validation_password: $('#password_game_access_input').val()
        },
        function(data) {
            if(data.result == 'ok') {
                $.post('/linkGameAndUser',
                    {
                        user: user_logged._id,
                        game: current_game_id
                    },
                    function(data, status){},
                    "json"
                );
                $('#access_secure_games_div').hide();
                $('#Game_management_div').show();
                $('#main_page').hide();
                $('#room_page').show();
                $('#room_page').load('html/room_page.html');
            } else {
                $('#password_game_access_input').after('<span class="error_access_secure_game">*Error: Password incorrect</span>');
            }
        },
        "json"
    );
};

/*
* Function to cancel the access to a secure game
* */
var cancel_access_secure_game = function() {
    current_game_id = null;
    $('.error_access_secure_game').remove();
    clear_inputs('access_secure_games_div');
    $('#access_secure_games_div').hide();
    $('#Game_management_div').show();
};