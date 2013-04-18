/**
 * Created with JetBrains WebStorm.
 * User: XiBi
 * Date: 11/04/13
 * Time: 17:26
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(list_user_games());

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
                        '<span>' + this.game_name + ' ' + this.game_current_num_of_players + '/' + this.game_num_of_players + '<input class="enter_game_button" type="button" value="Enter" onclick="javascript:enter_game_button_behaviour(\'' + this._id + '\')"/> </span>' +
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
    $('.error_new_game_validation').remove();
    if(validate_game()) {
        $.post('/addGame',
            {
                name: $('#game_name_input').val(),
                password: $('#game_pass_input').val(),
                n_players: $('#game_players_number_input').val()
            },
            function(data,status){
                alert(data._id);
            },
            "json"
        );
        $('#new_game_info').hide();
        //Redirigir a la sala en canvi de mostrar de nou el llistat
        own_games_button_behaviuour();
        alert("Game created");
    }
};

/*
 * Function to validate register data, return true if everything OK
 * */
var validate_game = function() {
    var validation = true;
    var name = $('#game_name_input').val();

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
    alert(game_id);
};

/*
 * Function to define the behaviour of the continue game button
 * */
var continue_game_button_behaviour = function() {

};