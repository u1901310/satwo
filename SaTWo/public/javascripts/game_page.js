var socket = io.connect('http://localhost:3000/');

var player_id;
var resources_conquer = {
                            brick: 0,  //1
                            lumber: 1, //1
                            ore: 0,    //0
                            wool: 0,   //1
                            grain: 0   //1
                        };
var resources_update = {
                            brick: 1, //3
                            lumber: 0,//0
                            ore: 0,   //0
                            wool: 0,  //1
                            grain: 0  //2
                        };
var resources_weapon = {
                            brick: 0, //0
                            lumber: 0,//2
                            ore: 1,   //2
                            wool: 0,  //0
                            grain: 0  //0
                        };

var dices_throwed;
var thief_enabled;
var territories_info;
var position_x_img;
var position_y_img;
var stage;
var num_images;
var sources;
var ids;
var images;
var kinetic_images;
var filled_layers;
var contour_layers;
var thief_layer;

$(document).ready(function(){
//    $.getJSON('getGame/' + current_game_id, function(game) {
//        $.each(game.game_players, function() {
//            if (this.player_user_id == user_logged._id) player_id = this.player_id;
//        });
//    });
//    $('#info_space').text(' ');

    init_game_page();

    socket.on('init_game_page_sent', function() {
        init_game_page();
    });

    socket.on('conquer_territory_received', function(image, player_id) {
        drawFilledImage(image, player_id);
    });

    socket.on('thief_received', function(imageObj) {
        drawThiefImage(imageObj);
    });
    socket.on('enable_dices_received', function(data) {
        alert('message received to enable dices');
        $.getJSON('/getGameTurn/' + current_game_id, function(turn) {
            alert(turn + " and " + player_id);
            if (player_id == turn) $('#dice_button').removeAttr("disabled");
        });
    });
    socket.on('game_won_received', function(data) {
        alert('Player ' + data.winner + ' has won by ' + data.way);
        $.post('/confirmEndGame',
            {
                game_id: current_game_id,
                player_id: player_id
            },
            function(data) {
                $('#game_page').hide();
                $('#chat_zone').hide();
                $('#main_page').show();
                $('#main_page').load('html/main_page.html');
            }
        );
    });
});

/*
 * Function to initialize the game page
 * */
function init_game_page() {
    $.getJSON('getGame/' + current_game_id, function(game) {
        $.each(game.game_players, function() {
            if (this.player_user_id == user_logged._id) player_id = this.player_id;
        });
    });
    $('#info_space').text(' ');

    dices_throwed = true;
    thief_enabled = false;

    territories_info = [];
    for (var i = 0; i < 42; i++) {
        territories_info.push(
            {
                neutral: false,
                enemy: false,
                own: false
            }
        );
    }

    init_map();
};

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




function action(image) {
    var territory_id = image.attrs.id;
    var territory_index = image.attrs.index;

    $.getJSON('getGame/' + current_game_id, function(game) {
        if (game.game_turn == player_id) {
            if (game.game_round == 1) { //First round of territory selection from 1 to n_players
                if (game.game_territories[territory_index].territory_ruler == null) {
                    $.post('/setTerritoryRuler',
                        {
                            game_id: current_game_id,
                            territory_id: territory_id,
                            player_id: player_id
                        },
                        function(data,status){
                            //socket.emit('conquer_territory_sent', image, player_id);
                        },
                        "json"
                    );

                    //drawFilledImage(image, player_id);
                    var imageObj = {
                        //image: image.attrs.image,
                        desc: image.attrs.desc,
                        id: image.attrs.id,
                        index: image.attrs.index,
                        width: image.attrs.width,
                        height: image.attrs.height,
                        x: image.attrs.x,
                        y: image.attrs.y
                    };
                    socket.emit('conquer_territory_sent', imageObj, player_id);

                    if (player_id < game.game_num_of_players) {
                        $.post('/setGameTurn',
                            {
                                game_id: current_game_id,
                                turn: new Number(game.game_turn) + 1
                            },
                            function(data,status){}
                        );
                    } else {
                        $.post('/setGameRound',
                            {
                                game_id: current_game_id,
                                round: new Number(game.game_round) + 1
                            },
                            function(data,status){}
                        );
                    }
                }
            } else if (game.game_round == 2) { //Second round of territory selection from n_player to 1, it territory generates resources
                if (game.game_territories[territory_index].territory_ruler == null) {
                    $.post('/setTerritoryRuler',
                        {
                            game_id: current_game_id,
                            territory_id: territory_id,
                            player_id: player_id
                        },
                        function(data,status){
                            //socket.emit('conquer_territory_sent', image, player_id);
                        }
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
                    }).done(function(data){
                        //socket.emit('conquer_territory_sent', image, player_id);
                    });

                    var imageObj = {
                        desc: image.attrs.desc,
                        id: image.attrs.id,
                        index: image.attrs.index,
                        width: image.attrs.width,
                        height: image.attrs.height,
                        x: image.attrs.x,
                        y: image.attrs.y
                    };
                    socket.emit('conquer_territory_sent', imageObj, player_id);

                    if (player_id > 1) {
                        $.post('/setGameTurn',
                            {
                                game_id: current_game_id,
                                turn: new Number(game.game_turn) - 1
                            },
                            function(data,status){}
                        );
                    } else {
                        $.post('/setGameRound',
                            {
                                game_id: current_game_id,
                                round: new Number(game.game_round) + 1
                            },
                            function(data,status){
                                dices_throwed = false;
                                //socket.emit('enable_dices_sent', {info: 'sent'});
                            }
                        );
                    }
                }
            } else { //Rounds of game (>2) here will be the actions that player could do
                if(dices_throwed) {
                    if (thief_enabled) {
                        $.getJSON('hasTerritoryThief/' + current_game_id + '/' + image.attrs.id, function(data){
                            if (!data.thief) {
                                var imageObj = {
                                    desc: image.attrs.desc,
                                    id: image.attrs.id,
                                    index: image.attrs.index,
                                    width: image.attrs.width,
                                    height: image.attrs.height,
                                    x: image.attrs.x,
                                    y: image.attrs.y
                                };
                                socket.emit('thief_sent', imageObj);

                                $.post('/thiefAction',
                                    {
                                        game_id: current_game_id,
                                        player_id: player_id,
                                        territory_id: image.attrs.id
                                    },
                                    function(){
                                        clickable_territories();
                                    }
                                );

                                thief_enabled = false;
                            }
                        });

                        $('#end_turn_button').removeAttr("disabled");
                    }
                    else {
                        if(territories_info[territory_index].neutral) { //It's a neutral territory
                            var conf = confirm("Conquer?");
                            if (conf) {
                                $.post('/spendResources',
                                    {
                                        game_id: current_game_id,
                                        resources: resources_conquer,
                                        player_id: player_id
                                    },
                                    function(data,status){
                                        $.post('/setTerritoryRuler',
                                            {
                                                game_id: current_game_id,
                                                territory_id: territory_id,
                                                player_id: player_id
                                            },
                                            function(data,status){
                                                var imageObj = {
                                                    desc: image.attrs.desc,
                                                    id: image.attrs.id,
                                                    index: image.attrs.index,
                                                    width: image.attrs.width,
                                                    height: image.attrs.height,
                                                    x: image.attrs.x,
                                                    y: image.attrs.y
                                                };
                                                socket.emit('conquer_territory_sent', imageObj, player_id);
                                                clickable_territories();
                                            }
                                        );
                                    }
                                );
                            }
                        } else if(territories_info[territory_index].enemy) { //It's an enemy territory
                            var conf = confirm("Attack?");
                            if (conf) {
                                var player;
                                var i = 0;
                                while (!player) {
                                    if (game.game_players[i].player_id = player_id) {
                                        player = game.game_players[i];
                                    }
                                    i++;
                                }

                                $.post('/useWeapons',
                                    {
                                        game_id: current_game_id,
                                        weapons: select_weapons(game.game_territories[territory_index].territory_level, player.player_weapons),
                                        player_id: player_id
                                    },
                                    function(data,status){
                                        $.post('/setTerritoryRuler',
                                            {
                                                game_id: current_game_id,
                                                territory_id: territory_id,
                                                player_id: player_id
                                            },
                                            function(data,status){
                                                var imageObj = {
                                                    desc: image.attrs.desc,
                                                    id: image.attrs.id,
                                                    index: image.attrs.index,
                                                    width: image.attrs.width,
                                                    height: image.attrs.height,
                                                    x: image.attrs.x,
                                                    y: image.attrs.y
                                                };
                                                socket.emit('conquer_territory_sent', imageObj, player_id);
                                                clickable_territories();
                                            }
                                        );
                                    }
                                );
                            }
                        } else if(territories_info[territory_index].own) { //It's our own territory
                            var conf = confirm("Update?");
                            if (conf) {
                                $.post('/spendResources',
                                    {
                                        game_id: current_game_id,
                                        resources: resources_update,
                                        player_id: player_id
                                    },
                                    function(data,status){
                                        $.post('/updateTerritory',
                                            {
                                                game_id: current_game_id,
                                                territory_id: territory_id
                                            },
                                            function(data,status){
                                                clickable_territories();
                                            }
                                        );
                                    }
                                );
                            }
                        }
                    }
                } else {
                    alert("You have to throw the dices");
                    //Focus throw dices button
                }
            }
        }
    });
};

/*
* Function to end the current turn
* */
var end_turn = function() {
    $('#end_turn_button').attr("disabled", "disabled");

    $('#weapon_lvl1_button').attr("disabled", "disabled");
    $('#weapon_lvl2_button').attr("disabled", "disabled");
    $('#weapon_lvl3_button').attr("disabled", "disabled");
    dices_throwed = false;
    $('#info_space').text(dices_throwed);
    $.getJSON('/nextGameTurn/' + current_game_id, function(data) {
        removeContourLayers();
        //socket.emit('enable_dices_sent', {info: 'sent'});
    });
}

/*
* Function to simulate a throw of dices and update some info like players resources or auxiliary info to show the clickable territories
* */
var throw_dices = function() {

    //$('#dice_button').attr("disabled", "disabled");


    var dice1 = Math.floor(Math.random()*6) + 1;
    var dice2 = Math.floor(Math.random()*6) + 1;
    var result = dice1 + dice2;

    if(result == 7) { //Realitzar acció lladre
        thief_enabled = true;
        $('#end_turn_button').attr("disabled", "disabled");
    } else {
        $.post('/addResourcesFromTerritoryByNumber',
                {
                    game_id: current_game_id,
                    territory_number: result
                },
                function(data) {
                    //Actualitzar els comptadors (sockets)

                    clickable_territories();
                }
        );
        $('#end_turn_button').removeAttr("disabled");
    }
    dices_throwed = true;
    $('#info_space').text(dices_throwed + ' (' + result + ')');
}

var alrt = false;

/*
* Function to select all the territories clickables for the current player.
* */
var clickable_territories = function() {
    var check_conquer = false;
    var check_update = false;
    var check_attack_lvl1 = false;
    var check_attack_lvl2 = false;
    var check_attack_lvl3 = false;
    var check_buy_weapon = false;
    var player_level = 1;

    removeContourLayers();

    $.getJSON('isWinner/' + current_game_id + '/' + player_id, function(data) {
        alert("Checking territories");
        if (data.win) {
            socket.emit('game_won_sent',{winner: player_id, way: data.way});
            //alert("I have won!");
        } else {
            $.getJSON('getGame/' + current_game_id, function(game) {
                var player;
                var i = 0;
                while (!player) {
                    if (game.game_players[i].player_id == player_id) {
                        player = game.game_players[i];
                    }
                    i++;
                }

                check_conquer = are_greater(player.player_resources, resources_conquer);
                check_update = are_greater(player.player_resources, resources_update);

                var weapons_check = check_weapons(player.player_weapons);
                check_attack_lvl1 = weapons_check[0];
                check_attack_lvl2 = weapons_check[1];
                check_attack_lvl3 = weapons_check[2];

                check_buy_weapon = are_greater(player.player_resources, resources_weapon);

                if (alrt) alert("Checking the clicable territories (" + game.game_territories.length + ")");
                for(var i = 0; i < game.game_territories.length; i++) {
                    /*
                     * Per cada territori comprovar si algun adjacent és nostre, en cas afirmatiu:
                     *  Si es neutre i check_conquer llavors canviar imatge i guardar info
                     *  Si es enemic, compravar el lvl i el check_attacklvl llavors canviar imatge i guardar info
                     * En cas contrari comprovar si es nostre
                     *   En cas afirmatiu i check_update llavors canviar imatge i guardar info
                     *   altrament guardar info indicant que no es clicable.
                     * */
                    var territory = game.game_territories[i];

                    if (territory.territory_ruler == game.game_turn && territory.territory_level > player_level) {
                        player_level = territory.territory_level;
                    }

                    if(territory.territory_ruler == game.game_turn && check_update && territory.territory_level < 4) {
                        if (alrt) alert("Own territory");
                        territories_info[i] = {neutral: false, enemy: false, own: true};
                        drawContouredImage(i);
                    } else {
                        var trobat = false;
                        var j = 0;
                        if (alrt) alert("Checking neighbours");
                        while(!trobat && j < territory.territory_neighbours.length) {
                            if (alrt) alert("Neighbour territory " + territory.territory_neighbours[j]);
                            if(game.game_territories[territory.territory_neighbours[j] - 1].territory_ruler == game.game_turn) {
                                trobat = true;
                            }
                            j++;
                        }
                        if(trobat) {
                            if(territory.territory_ruler == null && check_conquer) {
                                if (alrt) alert("Neutral territory");
                                territories_info[i] = {neutral: true, enemy: false, own: false};
                                drawContouredImage(i);
                            } else if(territory.territory_ruler != null && territory.territory_ruler != game.game_turn && ((territory.territory_level == 1 && check_attack_lvl1) || (territory.territory_level == 2 && check_attack_lvl2) || (territory.territory_level == 3 && check_attack_lvl3))) {
                                if (alrt) alert("Enemy territory");
                                territories_info[i] = {neutral: false, enemy: true, own: false};
                                drawContouredImage(i);
                            } else {
                                if (alrt) alert("Non clicable territory");
                                territories_info[i] = {neutral: false, enemy: false, own: false};
                            }
                        } else {
                            if (alrt) alert("Non clicable territory");
                            territories_info[i] = {neutral: false, enemy: false, own: false};
                        }
                    }
                }

                for (var i = 1; i < player_level; i++) {
                    if (check_buy_weapon) $('#weapon_lvl' + i + '_button').removeAttr("disabled");
                }
            });
        }
    });
}

/*
* Function to check if A resources are greater than B resources
* */
var are_greater = function(a_resources, b_resources) {
    return (new Number(a_resources.brick) >= b_resources.brick)
        && (new Number(a_resources.lumber) >= b_resources.lumber)
        && (new Number(a_resources.ore) >= b_resources.ore)
        && (new Number(a_resources.wool) >= b_resources.wool)
        && (new Number(a_resources.grain) >= b_resources.grain);
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

function select_weapons(level, weapons) {
    var result = {weapon_level_1: 0, weapon_level_2: 0, weapon_level_3: 0};

    if (level == 1) {
        if (weapons.weapon_level_1 > 0) {
            result.weapon_level_1 += 1;
        }
        else if (weapons.weapon_level_2 > 0) {
            result.weapon_level_2 += 1;
        }
        else if (weapons.weapon_level_3 > 0) {
            result.weapon_level_3 += 1;
        }
    }
    else if (level == 2) {
        if (weapons.weapon_level_2 > 0) {
            result.weapon_level_2 += 1;
        }
        else {
            if (weapons.weapon_level_1 > 1) {
                result.weapon_level_1 += 2;
            }
            else if (weapons.weapon_level_3 > 0) {
                result.weapon_level_3 += 1;
            }
        }
    }
    else {
        if (weapons.weapon_level_3 > 0) {
            result.weapon_level_3 += 1;
        }
        else {
            if (weapons.weapon_level_2 > 0) {
                if (weapons.weapon_level_1 > 0) {
                    result.weapon_level_2 += 1;
                    result.weapon_level_1 += 1;
                }
                else {
                    if (weapons.weapon_level_2 > 1) {
                        result.weapon_level_2 += 2;
                    }
                }
            }
            else {
                if (weapons.weapon_level_1 > 2) {
                    result.weapon_level_1 += 3;
                }
            }
        }
    }

    return result;
};

function buyWeapon(level) {
    $('#weapon_lvl1_button').attr("disabled", "disabled");
    $('#weapon_lvl2_button').attr("disabled", "disabled");
    $('#weapon_lvl3_button').attr("disabled", "disabled");

    $.post('/spendResources',
        {
            game_id: current_game_id,
            resources: resources_weapon,
            player_id: player_id
        },
        function(data,status){
            $.post('/buyWeapon',
                {
                    game_id: current_game_id,
                    player_id: player_id,
                    level: level
                },
                function(data){
                    clickable_territories();
                }
            );
        }
    );
}

function roundRect(x, y, w, h, r) {
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


function init_map() {
    position_x_img = 100;
    position_y_img = 15;
    stage = new Kinetic.Stage({
        container: 'container',
        width: 800,
        height: 340
    });

    var layer = new Kinetic.Layer();

    var background_rect = roundRect(40, 10, 720, 320, 15);
    background_rect.setFill('rgba(149,161,77,0.25)');
    background_rect.setStroke('rgba(149,161,77,0)');
    layer.add(background_rect);

    stage.add(layer);


    //var num_images;
    sources = [];
    ids = [];

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


    kinetic_images = [];

    filled_layers = [];
    contour_layers = [];
    thief_layer = new Kinetic.Layer();

    for (var i = 0; i < 42; i++) {
        filled_layers.push(new Kinetic.Layer());
        contour_layers.push(new Kinetic.Layer());
    }


    var imagesDir = '/images/territories/neutral/';
    images = {};
    var loadedImages = 0;
    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if (++loadedImages >= num_images) {
                initStage();
            }
        };
        images[src].src = imagesDir + sources[src];
    }
}



function drawFilledImage(imageObj, player_id) {
    filled_layers[imageObj.index].removeChildren();

    var img = new Image();
    img.onload = function() {
        var kin_img = new Kinetic.Image({
            image: img,
            desc: imageObj.desc,
            id: imageObj.id,
            index: imageObj.index,
            width: imageObj.width,
            height: imageObj.height,
            x: imageObj.x,
            y: imageObj.y
        });

        kin_img.on('mouseover', function() {
            $('#test').val(this.attrs.desc);
            this.setOpacity(0.3);
            $('#container').css('cursor','pointer')
            filled_layers[this.attrs.index].draw();
            showTerritoryInformation(this);
        });
        kin_img.on('mouseout', function() {
            $('#test').val('');
            this.setOpacity(1);
            $('#container').css('cursor','auto')
            filled_layers[this.attrs.index].draw();
            hideTerritoryInformation();
        });
        kin_img.on('click', function() {
            action(this);
        });

        kin_img.createImageHitRegion(function() {
            filled_layers[this.attrs.index].draw();
        });

        filled_layers[imageObj.index].add(kin_img);
        filled_layers[imageObj.index].draw();
    };
    img.src = '/images/territories/filled/player' + player_id + '/territory' + (imageObj.index+1) + '.png';
};

function drawContouredImage(index) {
    var img = new Image();
    img.onload = function() {
        var kin_img = new Kinetic.Image({
            image: img,
            x: position_x_img,
            y: position_y_img
        });

        kin_img.createImageHitRegion(function() {
            contour_layers[index].draw();
        });

        contour_layers[index].add(kin_img);
        contour_layers[index].draw();

        stage.add(contour_layers[index]);
    };
    img.src = '/images/territories/contoured/player' + player_id + '/territory' + (index+1) + '.png';
};

function removeContourLayers() {
    for (var i = 0; i < 42; i++) {
        contour_layers[i].removeChildren();
        contour_layers[i].draw();
    }
};

function drawThiefImage(imageObj) {

    thief_layer.removeChildren();
    thief_layer.draw();

    var img = new Image();
    img.onload = function() {
        var kin_img = new Kinetic.Image({
            image: img,
            desc: imageObj.desc,
            id: imageObj.id,
            index: imageObj.index,
            width: imageObj.width,
            height: imageObj.height,
            x: imageObj.x,
            y: imageObj.y
        });

        kin_img.on('mouseover', function() {
            $('#test').val(this.attrs.desc);
            filled_layers[this.attrs.index].setOpacity(0.3);
            filled_layers[this.attrs.index].draw();
            $('#container').css('cursor','pointer')
            thief_layer.draw();
            showTerritoryInformation(this);
        });
        kin_img.on('mouseout', function() {
            $('#test').val('');
            filled_layers[this.attrs.index].setOpacity(1);
            filled_layers[this.attrs.index].draw();
            $('#container').css('cursor','auto')
            thief_layer.draw();
            hideTerritoryInformation();
        });
        kin_img.on('click', function() {
            action(this);
        });

        kin_img.createImageHitRegion(function() {
            thief_layer.draw();
        });

        thief_layer.add(kin_img);
        thief_layer.draw();

        stage.add(thief_layer);
    };
    img.src = '/images/territories/thief/territory' + (imageObj.index+1) + '.png';
};





function initStage() {
    for (var i = 0; i < num_images; i++) {
        kinetic_images[i] = new Kinetic.Image({
            image: images[i],
            desc: sources[i],
            id: ids[i],
            index: i,
            width: images[i].width,
            height: images[i].height,
            x: position_x_img,
            y: position_y_img
        });

        kinetic_images[i].on('mouseover', function() {
            $('#test').val(this.getAttrs().desc);
            this.setOpacity(0.3);
            $('#container').css('cursor','pointer')
            filled_layers[this.getAttrs().index].draw();
            showTerritoryInformation(this);
        });
        kinetic_images[i].on('mouseout', function() {
            $('#test').val('');
            this.setOpacity(1);
            $('#container').css('cursor','auto')
            filled_layers[this.getAttrs().index].draw();
            hideTerritoryInformation();
        });
        kinetic_images[i].on('click', function() {
            action(this);
        });

        kinetic_images[i].createImageHitRegion(function() {
            filled_layers[this.getAttrs().index].draw();
        });

        filled_layers[i].add(kinetic_images[i]);

        stage.add(filled_layers[i]);
    }
}


function showTerritoryInformation(image) {
    $.getJSON('/getGame/' + current_game_id, function(game) {
        $.each(game.game_territories, function() {
            if (this.territory_id == image.attrs.id) {
                $('#territories').append('<span><b>    Territory ' + image.attrs.index + '</b></span><br>');
                $('#territories').append('<span><b>    Random number: </b>' + this.territory_random_number + '</span><br>');
                $('#territories').append('<span><b>    Resources: </b><br>' + this.territory_resources[0] + ' (brick)<br> ' +
                    this.territory_resources[1] + ' (lumber)<br> ' +
                    this.territory_resources[2] + ' (ore)<br> ' +
                    this.territory_resources[3] + ' (wool)<br> ' +
                    this.territory_resources[4] + ' (grain)</span><br>');
                $('#territories').append('<span><b>    Ruler: </b>' + this.territory_ruler + '</span><br>');
                $('#territories').append('<span><b>    Level: </b>' + this.territory_level + '</span><br>');
                $('#territories').append('<span><b>    Thief: </b>' + this.territory_thief + '</span><br><br>');
            }
        });
    });
};

function hideTerritoryInformation() {
    $('#territories').empty();
};