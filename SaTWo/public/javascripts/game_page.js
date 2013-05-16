//$(document).ready(function() {
    /*
    $.getJSON('/getTerritories/', function(territories) {
        $.each(territories, function() {
            $('#territories').append('<span>' + this._id + '</span><br>');
            $('#territories').append('<span>' + this.territory_image + '</span><br>');
            $('#territories').append('<span>' + this.territory_size + '</span><br><br>');
        });
    });
    */

    /*
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
    */
//});

var player_id;
var resources_conquer = {
                            brick: 0,
                            lumber: 0,
                            ore: 0,
                            wool: 0,
                            grains: 0
                        };
var resources_update = {
                            brick: 0,
                            lumber: 0,
                            ore: 0,
                            wool: 0,
                            grains: 0
                        };

$(document).ready(function(){
    $.getJSON('getGame/' + current_game_id, function(game) {
        $.each(game.game_players, function() {
            if (this.player_user_id == user_logged._id) player_id = this.player_id;
        });
    });
    $('#Dices_space').text(dices_throwed);
});

/*
* Action defines all possible actions during the game.
*   in round 1 and 2 is to assign the first territories to each user
*   in Round 1 the selection is from 1 to num_of_players
*   in Round 2 the selection is from num_of players to 1 and from those territories players will get resources
*   Since Round 3 each player will have to:
*    1 - throw the dices to make the territories generate resources to their dominator if the result is their number (special case for 7)
*        this function will be implemented outset.
*    2 - make any of those actions:
*       - Update self territories
*       - Conquer neutral neighboring territories
*       - Invade enemy neighboring territories
*       - (Other accions implemented in future)
*    3 - Finish turn, this will increment the turn counter and if the player is the last it will increment the round and set the turn to 1
* */
var dices_throwed = false;
var territories_info = [];

function action(territory_id) {
    $.getJSON('getGame/' + current_game_id, function(game) {
        if (game.game_turn == player_id) {
            if (game.game_round == 1) { //First round of territory selection from 1 to n_players
                $.post('/setTerritoryRuler',
                    {
                        game_id: current_game_id,
                        territory_id: territory_id,
                        player_id: player_id
                    },
                    function(data,status){},
                    "json"
                );

                if (player_id < game.game_num_of_players) {
                    $.post('/setGameTurn',
                        {
                            game_id: current_game_id,
                            turn: new Number(game.game_turn) + 1
                            //turn: game.game_turn + 1
                        },
                        function(data,status){},
                        "json"
                    );
                } else {
                    $.post('/setGameRound',
                        {
                            game_id: current_game_id,
                            round: new Number(game.game_round) + 1
                            //round: game.game_round + 1
                        },
                        function(data,status){},
                        "json"
                    );
                }
            } else if (game.game_round == 2) { //Second round of territory selection from n_player to 1, it territory generates resources
                $.post('/setTerritoryRuler',
                    {
                        game_id: current_game_id,
                        territory_id: territory_id,
                        player_id: player_id
                    },
                    function(data,status){},
                    "json"
                );

                $.ajax({
                    url: '/addResourcesFromTerritory',
                    type: 'POST',
                    data: {
                        game_id: current_game_id,
                        territory_id: territory_id,
                        player_id: player_id
                    },
                    async: false
                }).done(function(data){});

                if (player_id > 1) {
                    $.post('/setGameTurn',
                        {
                            game_id: current_game_id,
                            turn: new Number(game.game_turn) - 1
                            //turn: game.game_turn - 1
                        },
                        function(data,status){},
                        "json"
                    );
                } else {
                    $.post('/setGameRound',
                        {
                            game_id: current_game_id,
                            round: new Number(game.game_round) + 1
                            //round: game.game_round + 1
                        },
                        function(data,status){},
                        "json"
                    );
                }
            } else { //Rounds of game (>2) here will be the actions that player could do
                if(dices_throwed) {
                    //Estaria bé tenir una array d'objectes {neutral:boolean, enemy:boolean, own:boolean} que s'actualitzes al tirar els daus
                    //Aixi podriem actualitzar les imatges i aprofitar per coneixer la informacio
                    if(territories_info[territory_id].neutral) { //It's a neutral territory
                        alert("Conquer");
                    } else if(territories_info[territory_id].enemy) { //It's an enemy territory
                        alert("Attack");
                    } else if(territories_info[territory_id].own) { //It's our own territory
                        alert("Update");
                    }
                } else {
                    alert("You have to throw the dices");
                    //Focus throw dices button
                }
                /*if (daus llançats) {
                    if (territory_id és neutre) {
                        acció per a territori neutre
                        mostrar missatge de consum de recursos per conquerir
                        si acceptar assignar nou dominador i reduir recursos
                        altrament no fer res
                        Comprovar si ha guanyat
                    }
                    else if (territory_id és ocupat) {
                        acció per a territori ocupat
                        mostrar missatge de consum de recursos per atacar
                        si acceptar assignar nou dominador i reduir recursos
                        altrament no fer res
                        Comprovar si ha guanyat
                    }
                    else { //territory_id és meu
                        acció per a territori meu
                    }

                }*/
            }
        }
    });
};

/*
* Function to end the current turn
* */
var end_turn = function() {
    dices_throwed = false;
    $('#Dices_space').text(dices_throwed);
    $.getJSON('/nextGameTurn/' + current_game_id, function(data) {
       //Netajar els territoris clickable
    });
}

/*
* Function to simulate a throw of dices and update some info like players resources or auxiliary info to show the clickable territories
* */
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Cal acabar
var throw_dices = function() {
    var dice1 = Math.floor(Math.random()*6) + 1;
    var dice2 = Math.floor(Math.random()*6) + 1;
    var result = dice1 + dice2;

    alert(result);
    //Mostrar el resultat de la tirada
    if(result == 7) {
        //Realitzar acció lladre
    } else {
        //Assignar recursos als jugadors dominadors d'un territori amb el numero = result (peticio servidor)
        $.post('/addResourcesFromTerritoryByNumber',
                {
                    game_id: current_game_id,
                    territory_number: result
                },
                function(data) {
                    //Actualitzar els comptadors (sockets)
                },
                "json"
        );
    }
    //Per sincronisme, poder s'ha de duplicar i posar al retorn del afegir recursos i del lladre.
    dices_throwed = true;
    $('#Dices_space').text(dices_throwed);
    //Comprovar territoris clicables (funcio per actualitzar imatges i la variable territories_info) funcio clickable_territories!!!!
    //Haura de comprar si tenim recursos per realitzar les diferents accions i marcar tots els territoris on les poguem fer
    clickable_territories();
}

/*
* Function to select all the territories clickables for the current player.
* */
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1 cal acabar
var clickable_territories = function() {
    var check_conquer = false;
    var check_update = false;
    var check_attack_lvl1 = false;
    var check_attack_lvl2 = false;
    var check_attack_lvl3 = false;

    $.getJSON('getGame/' + current_game_id, function(game) {
        var player = game.game_players[game.game_turn];

        check_conquer = are_greater(player.player_resources, resources_conquer);
        check_update = are_greater(player.player_resources, resources_update);

        var weapons_check = check_weapons(player.player_weapons);
        check_attack_lvl1 = weapons_check[0];
        check_attack_lvl2 = weapons_check[1];
        check_attack_lvl3 = weapons_check[2];

        alert("Checking the clicable territories");
        for(var i = 0; i < game.game_territories.length; i++) {
            /*
            * Per cada territori comprovar si algun adjacent és nostre, en cas afirmatiu:
            *  Si es neutre i check_conquer llavors canviar imatge i guardar info
            *  Si es enemic, compravar el lvl i el check_attacklvl llavors canviar imatge i guardar info
            * En cas contrari comprovar si es nostre
            *   En cas afirmatiu i check_update llavors canviar imatge i guardar info
            *   altrament guardar info indicant que no es clicable.
            * */
            alert("Territory " + (i+1));
            var territory = game.game_territories[i];
            var trobat = false;
            var j = 0;
            alert("Checking neighbours");
            while(!trobat && j < territory.territory_neighbours.length) {
                alert("Neighbour territory " + territory.territory_neighbours[j]);
                if(game.game_territories[territory.territory_neighbours[j]].territory_ruler == game.game_turn) {
                    trobat = true;
                    alert("Neighbour is our territory");
                }
                j++;
            }
            if(trobat && check_conquer) {
                alert("Neutral territory");
                territories_info[territory._id] = {neutral: true, enemy: false, own: false};
                //Actualitzar imatge per mostrar que es neutral
            } else if(territory.territory_ruler == game.game_turn && check_update) {
                alert("Own territory");
                territories_info[territory._id] = {neutral: false, enemy: false, own: true};
                //Actualitzar imatge per mostrar que es pot actualitzar
            } else if(trobat && ((territory.territory_level == 1 && check_attack_lvl1) || (territory.territory_level == 2 && check_attack_lvl2) || (territory.territory_level == 3 && check_attack_lvl3))) {
                alert("Enemy territory");
                territories_info[territory._id] = {neutral: false, enemy: true, own: false};
                //Actualitzar imatge per mostrar que es atacable
            } else {
                alert("Non clicable territory");
                territories_info[territory._id] = {neutral: false, enemy: false, own: false};
            }
        }
        alert("Territories info:/n " + territories_info);
    });
}

/*
* Function to check if A resources are greater than B resources
* */
var are_greater = function(a_resources, b_resources) {
    return (a_resources.brick >= b_resources.brick) && (a_resources.lumber >= b_resources.lumber) && (a_resources.ore >= b_resources.ore) && (a_resources.wool >= b_resources.wool) && (a_resources.grain >= b_resources.grain);
}

/*
 * Function to check if player have enough weapons to attack territories of lvl1 or lvl2 or lvl3
 * */
var check_weapons = function(weapons) {
    var result = [false, false, false];
    var check = weapons.weapon_level_1 * 1 + weapons.weapon_level_2 * 2 + weapons.weapon_level_3 * 3;

    if(check > 0) {
        result[0] = true;
    }
    if(check > 1) {
        result[1] = true;
    }
    if(check > 2) {
        result[2] = true;
    }
    return result;
}



var roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    return new Kinetic.Shape({
        drawFunc: function (canvas) {
            var context = canvas.getContext();
            context.beginPath();
            context.moveTo(x+r, y);
            context.arcTo(x+w, y, x+w, y+h, r);
            context.arcTo(x+w, y+h, x, y+h, r);
            context.arcTo(x, y+h, x, y, r);
            context.arcTo(x, y, x+w, y, r);
            context.closePath();
            canvas.fillStroke(this);
        }
    });
};


var stage = new Kinetic.Stage({
    container: 'container',
    width: 800,
    height: 600
});

var layer = new Kinetic.Layer();


//$(document).ready(function() {
    var background_rect = roundRect(40, 130, 720, 320, 15);
    //var background_rect = roundRect(40, 80, 720, 320, 15);
    background_rect.setFill('rgba(149,161,77,0.25)');
    background_rect.setStroke('rgba(149,161,77,0)');
    layer.add(background_rect);

    /*
    var map = new Image();
    map.onload = function() {
        var map_img = new Kinetic.Image({
            x: 150,
            y: 125,
            image: map,
            width: map.width * 0.6,
            height: map.height * 0.6
        });

        layer.add(map_img);
        stage.add(layer);
    }
    map.src = '/images/territories/map.png';
    */




var num_images;
var sources = [];
var ids = [];

$.ajax({
    url: 'getTerritories/',
    type: 'GET',
    async: false
}).done(function(territories) {
    num_images = territories.length;
    $.each(territories, function() {
        sources.push(this.territory_image);
        ids.push(this._id);
    });
});

var imagesDir = '/images/territories/';
var images = {};
var loadedImages = 0;
for (var src in sources) {
    images[src] = new Image();
    images[src].onload = function() {
        if (++loadedImages >= num_images) {
            initStage(images);
        }
    };
    images[src].src = imagesDir + sources[src];
}


function initStage(images) {
    var kinetic_images = [];
    for (var i = 0; i < num_images; i++) {
        kinetic_images[i] = new Kinetic.Image({
            image: images[i],
            desc: sources[i],
            id: ids[i],
            x: 150,
            y: 125
        });

        kinetic_images[i].on('mouseover', function() {
            $('#test').val(this.attrs.desc);
            this.setOpacity(0.3);
            $('#container').css('cursor','pointer')
            layer.draw();
            showTerritoryInformation(this);
        });
        kinetic_images[i].on('mouseout', function() {
            $('#test').val('');
            this.setOpacity(1);
            $('#container').css('cursor','auto')
            layer.draw();
            hideTerritoryInformation();
        });
        kinetic_images[i].on('click', function() {
            action(this.attrs.id);
        });

        kinetic_images[i].createImageHitRegion(function() {
            layer.draw();
        });

        layer.add(kinetic_images[i]);
    }
    stage.add(layer);
}


function showTerritoryInformation(image) {
    $.getJSON('/getGame/' + current_game_id, function(game) {
        $.each(game.game_territories, function() {
            if (this.territory_id == image.attrs.id) {
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
            }
        });
    });
};

function hideTerritoryInformation() {
    $('#games').empty();
};


//});




/*
// Player 1
var bg_rect_p1 = roundRect(10, 135, 100, 100, 15);
bg_rect_p1.setFill('rgba(255,0,0,0.25)');
bg_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(bg_rect_p1);

var name_rect_p1 = roundRect(15, 140, 90, 20, 5);
name_rect_p1.setFill('rgba(99,37,35,0.25)');
name_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(name_rect_p1);

var faction_rect_p1 = roundRect(15, 161, 90, 20, 5);
faction_rect_p1.setFill('rgba(99,37,35,0.25)');
faction_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(faction_rect_p1);

var brick_rect_p1 = roundRect(15, 182, 17, 27, 5);
brick_rect_p1.setFill('rgba(99,37,35,0.25)');
brick_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(brick_rect_p1);

var lumber_rect_p1 = roundRect(33, 182, 17, 27, 5);
lumber_rect_p1.setFill('rgba(99,37,35,0.25)');
lumber_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(lumber_rect_p1);

var ore_rect_p1 = roundRect(51, 182, 17, 27, 5);
ore_rect_p1.setFill('rgba(99,37,35,0.25)');
ore_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(ore_rect_p1);

var wool_rect_p1 = roundRect(69, 182, 17, 27, 5);
wool_rect_p1.setFill('rgba(99,37,35,0.25)');
wool_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(wool_rect_p1);

var grain_rect_p1 = roundRect(87, 182, 17, 27, 5);
grain_rect_p1.setFill('rgba(99,37,35,0.25)');
grain_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(grain_rect_p1);

var cards_rect_p1 = roundRect(15, 210, 90, 20, 5);
cards_rect_p1.setFill('rgba(99,37,35,0.25)');
cards_rect_p1.setStroke('rgba(0,0,0,0)');
layer.add(cards_rect_p1);


// Player 2
var bg_rect_p2 = roundRect(10, 240, 100, 100, 15);
bg_rect_p2.setFill('rgba(244,128,12,0.25)');
bg_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(bg_rect_p2);

var name_rect_p2 = roundRect(15, 245, 90, 20, 5);
name_rect_p2.setFill('rgba(152,72,7,0.25)');
name_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(name_rect_p2);

var faction_rect_p2 = roundRect(15, 266, 90, 20, 5);
faction_rect_p2.setFill('rgba(152,72,7,0.25)');
faction_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(faction_rect_p2);

var brick_rect_p2 = roundRect(15, 287, 17, 27, 5);
brick_rect_p2.setFill('rgba(152,72,7,0.25)');
brick_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(brick_rect_p2);

var lumber_rect_p2 = roundRect(33, 287, 17, 27, 5);
lumber_rect_p2.setFill('rgba(152,72,7,0.25)');
lumber_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(lumber_rect_p2);

var ore_rect_p2 = roundRect(51, 287, 17, 27, 5);
ore_rect_p2.setFill('rgba(152,72,7,0.25)');
ore_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(ore_rect_p2);

var wool_rect_p2 = roundRect(69, 287, 17, 27, 5);
wool_rect_p2.setFill('rgba(152,72,7,0.25)');
wool_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(wool_rect_p2);

var grain_rect_p2 = roundRect(87, 287, 17, 27, 5);
grain_rect_p2.setFill('rgba(152,72,7,0.25)');
grain_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(grain_rect_p2);

var cards_rect_p2 = roundRect(15, 315, 90, 20, 5);
cards_rect_p2.setFill('rgba(152,72,7,0.25)');
cards_rect_p2.setStroke('rgba(0,0,0,0)');
layer.add(cards_rect_p2);


// Player 3
var bg_rect_p3 = roundRect(10, 345, 100, 100, 15);
bg_rect_p3.setFill('rgba(255,255,0,0.25)');
bg_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(bg_rect_p3);

var name_rect_p3 = roundRect(15, 350, 90, 20, 5);
name_rect_p3.setFill('rgba(141,138,0,0.25)');
name_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(name_rect_p3);

var faction_rect_p3 = roundRect(15, 371, 90, 20, 5);
faction_rect_p3.setFill('rgba(141,138,0,0.25)');
faction_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(faction_rect_p3);

var brick_rect_p3 = roundRect(15, 392, 17, 27, 5);
brick_rect_p3.setFill('rgba(141,138,0,0.25)');
brick_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(brick_rect_p3);

var lumber_rect_p3 = roundRect(33, 392, 17, 27, 5);
lumber_rect_p3.setFill('rgba(141,138,0,0.25)');
lumber_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(lumber_rect_p3);

var ore_rect_p3 = roundRect(51, 392, 17, 27, 5);
ore_rect_p3.setFill('rgba(141,138,0,0.25)');
ore_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(ore_rect_p3);

var wool_rect_p3 = roundRect(69, 392, 17, 27, 5);
wool_rect_p3.setFill('rgba(141,138,0,0.25)');
wool_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(wool_rect_p3);

var grain_rect_p3 = roundRect(87, 392, 17, 27, 5);
grain_rect_p3.setFill('rgba(141,138,0,0.25)');
grain_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(grain_rect_p3);

var cards_rect_p3 = roundRect(15, 420, 90, 20, 5);
cards_rect_p3.setFill('rgba(141,138,0,0.25)');
cards_rect_p3.setStroke('rgba(0,0,0,0)');
layer.add(cards_rect_p3);


// Player 4
var bg_rect_p4 = roundRect(690, 135, 100, 100, 15);
bg_rect_p4.setFill('rgba(0,176,80,0.25)');
bg_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(bg_rect_p4);

var name_rect_p4 = roundRect(695, 140, 90, 20, 5);
name_rect_p4.setFill('rgba(79,98,40,0.25)');
name_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(name_rect_p4);

var faction_rect_p4 = roundRect(695, 161, 90, 20, 5);
faction_rect_p4.setFill('rgba(79,98,40,0.25)');
faction_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(faction_rect_p4);

var brick_rect_p4 = roundRect(695, 182, 17, 27, 5);
brick_rect_p4.setFill('rgba(79,98,40,0.25)');
brick_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(brick_rect_p4);

var lumber_rect_p4 = roundRect(713, 182, 17, 27, 5);
lumber_rect_p4.setFill('rgba(79,98,40,0.25)');
lumber_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(lumber_rect_p4);

var ore_rect_p4 = roundRect(731, 182, 17, 27, 5);
ore_rect_p4.setFill('rgba(79,98,40,0.25)');
ore_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(ore_rect_p4);

var wool_rect_p4 = roundRect(749, 182, 17, 27, 5);
wool_rect_p4.setFill('rgba(79,98,40,0.25)');
wool_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(wool_rect_p4);

var grain_rect_p4 = roundRect(767, 182, 17, 27, 5);
grain_rect_p4.setFill('rgba(79,98,40,0.25)');
grain_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(grain_rect_p4);

var cards_rect_p4 = roundRect(695, 210, 90, 20, 5);
cards_rect_p4.setFill('rgba(79,98,40,0.25)');
cards_rect_p4.setStroke('rgba(0,0,0,0)');
layer.add(cards_rect_p4);


// Player 5
var bg_rect_p5 = roundRect(690, 240, 100, 100, 15);
bg_rect_p5.setFill('rgba(112,48,160,0.25)');
bg_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(bg_rect_p5);

var name_rect_p5 = roundRect(695, 245, 90, 20, 5);
name_rect_p5.setFill('rgba(64,89,92,0.25)');
name_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(name_rect_p5);

var faction_rect_p5 = roundRect(695, 266, 90, 20, 5);
faction_rect_p5.setFill('rgba(64,89,92,0.25)');
faction_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(faction_rect_p5);

var brick_rect_p5 = roundRect(695, 287, 17, 27, 5);
brick_rect_p5.setFill('rgba(64,89,92,0.25)');
brick_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(brick_rect_p5);

var lumber_rect_p5 = roundRect(713, 287, 17, 27, 5);
lumber_rect_p5.setFill('rgba(64,89,92,0.25)');
lumber_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(lumber_rect_p5);

var ore_rect_p5 = roundRect(731, 287, 17, 27, 5);
ore_rect_p5.setFill('rgba(64,89,92,0.25)');
ore_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(ore_rect_p5);

var wool_rect_p5 = roundRect(749, 287, 17, 27, 5);
wool_rect_p5.setFill('rgba(64,89,92,0.25)');
wool_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(wool_rect_p5);

var grain_rect_p5 = roundRect(767, 287, 17, 27, 5);
grain_rect_p5.setFill('rgba(64,89,92,0.25)');
grain_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(grain_rect_p5);

var cards_rect_p5 = roundRect(695, 315, 90, 20, 5);
cards_rect_p5.setFill('rgba(64,89,92,0.25)');
cards_rect_p5.setStroke('rgba(0,0,0,0)');
layer.add(cards_rect_p5);


// Player 6
var bg_rect_p6 = roundRect(690, 345, 100, 100, 15);
bg_rect_p6.setFill('rgba(0,112,192,0.25)');
bg_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(bg_rect_p6);

var name_rect_p6 = roundRect(695, 350, 90, 20, 5);
name_rect_p6.setFill('rgba(37,64,97,0.25)');
name_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(name_rect_p6);

var faction_rect_p6 = roundRect(695, 371, 90, 20, 5);
faction_rect_p6.setFill('rgba(37,64,97,0.25)');
faction_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(faction_rect_p6);

var brick_rect_p6 = roundRect(695, 392, 17, 27, 5);
brick_rect_p6.setFill('rgba(37,64,97,0.25)');
brick_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(brick_rect_p6);

var lumber_rect_p6 = roundRect(713, 392, 17, 27, 5);
lumber_rect_p6.setFill('rgba(37,64,97,0.25)');
lumber_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(lumber_rect_p6);

var ore_rect_p6 = roundRect(731, 392, 17, 27, 5);
ore_rect_p6.setFill('rgba(37,64,97,0.25)');
ore_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(ore_rect_p6);

var wool_rect_p6 = roundRect(749, 392, 17, 27, 5);
wool_rect_p6.setFill('rgba(37,64,97,0.25)');
wool_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(wool_rect_p6);

var grain_rect_p6 = roundRect(767, 392, 17, 27, 5);
grain_rect_p6.setFill('rgba(37,64,97,0.25)');
grain_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(grain_rect_p6);

var cards_rect_p6 = roundRect(695, 420, 90, 20, 5);
cards_rect_p6.setFill('rgba(37,64,97,0.25)');
cards_rect_p6.setStroke('rgba(0,0,0,0)');
layer.add(cards_rect_p6);


stage.add(layer);
    */