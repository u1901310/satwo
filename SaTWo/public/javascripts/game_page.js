$(document).ready(function() {
    /*
    $.getJSON('/getTerritories/', function(territories) {
        $.each(territories, function() {
            $('#territories').append('<span>' + this._id + '</span><br>');
            $('#territories').append('<span>' + this.territory_image + '</span><br>');
            $('#territories').append('<span>' + this.territory_size + '</span><br><br>');
        });
    });
    */

    $.getJSON('/getGame/' + current_game_id, function(game) {
        $('#games').append('<span><b>Name: </b>' + game.game_name + '</span><br>');
        $('#games').append('<span><b>Password: </b>' + game.game_password + '</span><br>');
        $('#games').append('<span><b>Number of players: </b>' + game.game_num_of_players + '</span><br>');
        $('#games').append('<span><b>Current number of players: </b>' + game.game_current_num_of_players + '</span><br>');
        $('#games').append('<span><b>Public: </b>' + game.game_is_public + '</span><br>');
        $('#games').append('<span><b>Room administrator: </b>' + game.game_room_administrator + '</span><br><br>');

        $('#games').append('<span><b>USERS INFO</b></span><br>');
        $.each(game.game_users_info, function() {
            $('#games').append('<span><b>    Id: </b>' + this.user_id + '</span><br>');
            $('#games').append('<span><b>    Confirmation: </b>' + this.confirmation + '</span><br>');
            $('#games').append('<span><b>    Faction: </b>' + this.faction + '</span><br><br>');
        });

        $('#games').append('<span><b>PLAYERS INFO</b></span><br>');
        $.each(game.game_players, function() {
            $('#games').append('<span><b>    Id: </b>' + this.player_id + '</span><br>');
            $('#games').append('<span><b>    Faction: </b>' + this.player_faction+ '</span><br>');
            $('#games').append('<span><b>    Weapons: </b>' + this.player_weapons.weapon_level_1 + ' (level 1), ' +
                                                              this.player_weapons.weapon_level_2 + ' (level 2), ' +
                                                              this.player_weapons.weapon_level_3 + ' (level 3)</span><br>');
            $('#games').append('<span><b>    Resources: </b>' + this.player_resources.brick + ' (brick), ' +
                                                                this.player_resources.lumber + ' (lumber), ' +
                                                                this.player_resources.ore + ' (ore), ' +
                                                                this.player_resources.wool + ' (wool), ' +
                                                                this.player_resources.grain + ' (grain)</span><br><br>');
        });

        $('#games').append('<span><b>TERRITORIES INFO</b></span><br>');
        $.each(game.game_territories, function() {
            $('#games').append('<span><b>    Id: </b>' + this.territory_id + '</span><br>');
            $('#games').append('<span><b>    Random number: </b>' + this.territory_random_number + '</span><br>');
            $('#games').append('<span><b>    Resources: </b>' + this.territory_resources[0] + ' (brick), ' +
                                                                this.territory_resources[1] + ' (lumber), ' +
                                                                this.territory_resources[2] + ' (ore), ' +
                                                                this.territory_resources[3] + ' (wool), ' +
                                                                this.territory_resources[4] + ' (grain)</span><br>');
            $('#games').append('<span><b>    Ruler: </b>' + this.territory_ruler + '</span><br>');
            $('#games').append('<span><b>    Level: </b>' + this.territory_level + '</span><br>');
            $('#games').append('<span><b>    Thief: </b>' + this.territory_thief + '</span><br><br>');
        });
    });
});