var socket = io.connect('http://localhost:3000/');

var player_id;
var resources_conquer = {
                            brick: 0,
                            lumber: 0,
                            ore: 0,
                            wool: 0,
                            grain: 0
                        };
var resources_update = {
                            brick: 0,
                            lumber: 0,
                            ore: 0,
                            wool: 0,
                            grain: 0
                        };

$(document).ready(function(){
    $.getJSON('getGame/' + current_game_id, function(game) {
        $.each(game.game_players, function() {
            if (this.player_user_id == user_logged._id) player_id = this.player_id;
        });
    });
    $('#Dices_space').text(dices_throwed);

    socket.on('conquer_territory_received', function(image, player_id) {
        drawFilledImage(image, player_id);
    });

    socket.on('enable_dices_received', function(data) {
        $.getJSON('/getGameTurn/' + current_game_id, function(turn) {
            if(player_id == turn) $('#dice_button').removeAttr('disabled');
        });
    });
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
var dices_throwed = false; //true;
var territories_info = [];
for (var i = 0; i < 42; i++) {
    territories_info.push(
        {
            neutral: false,
            enemy: false,
            own: false
        }
    );
}

//function action(territory_id) {
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
                                //turn: game.game_turn + 1
                            },
                            function(data,status){}
                        );
                    } else {
                        $.post('/setGameRound',
                            {
                                game_id: current_game_id,
                                round: new Number(game.game_round) + 1
                                //round: game.game_round + 1
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

                    if (player_id > 1) {
                        $.post('/setGameTurn',
                            {
                                game_id: current_game_id,
                                turn: new Number(game.game_turn) - 1
                                //turn: game.game_turn - 1
                            },
                            function(data,status){}
                        );
                    } else {
                        $.post('/setGameRound',
                            {
                                game_id: current_game_id,
                                round: new Number(game.game_round) + 1
                                //round: game.game_round + 1
                            },
                            function(data,status){
                                //dices_throwed = false;//Diria que va aqui, cal confirmar
                                socket.emit('enable_dices_sent', {info: 'sent'});
                            }
                        );
                    }
                }
            } else { //Rounds of game (>2) here will be the actions that player could do
                if(dices_throwed) {
                    //Estaria bé tenir una array d'objectes {neutral:boolean, enemy:boolean, own:boolean} que s'actualitzes al tirar els daus
                    //Aixi podriem actualitzar les imatges i aprofitar per coneixer la informacio
                    if(territories_info[territory_index].neutral) { //It's a neutral territory
                        alert("Conquer");
                    } else if(territories_info[territory_index].enemy) { //It's an enemy territory
                        alert("Attack");
                    } else if(territories_info[territory_index].own) { //It's our own territory
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
            /*
            else { //Ronda > 2
                if (daus llançats) {
                    if (territory_id és neutre) {
                        acció per a territori neutre
                    }
                    else if (territory_id és ocupat) {
                        acció per a territori ocupat
                    }
                    else { //territory_id és meu
                        acció per a territori meu
                    }
                }

            }
            */
        }
    });
};

/*
* Function to end the current turn
* */
var end_turn = function() {
    $('#end_turn_button').attr("disabled", "disabled");
    dices_throwed = false;
    $('#Dices_space').text(dices_throwed);
    $.getJSON('/nextGameTurn/' + current_game_id, function(data) {
       //Netajar els territoris clickable
        socket.emit('enable_dices_sent', {info: 'sent'});
    });
}

/*
* Function to simulate a throw of dices and update some info like players resources or auxiliary info to show the clickable territories
* */
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Cal acabar
var throw_dices = function() {
    $('#dice_button').attr("disabled", "disabled");

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

    $('#end_turn_button').removeAttr("disabled");
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

        //alert("Checking the clicable territories (" + game.game_territories.length + ")");
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

            if(territory.territory_ruler == game.game_turn && check_update) {
                //alert("Own territory");
                //territories_info[territory._id] = {neutral: false, enemy: false, own: true};
                territories_info[i].own = true;
                drawContouredImage(i);
                //Actualitzar imatge per mostrar que es pot actualitzar
            } else {
                var trobat = false;
                var j = 0;
                //alert("Checking neighbours");
                while(!trobat && j < territory.territory_neighbours.length) {
                    //alert("Neighbour territory " + territory.territory_neighbours[j]);
                    if(game.game_territories[territory.territory_neighbours[j] - 1].territory_ruler == game.game_turn) {
                        trobat = true;
                        //alert("Neighbour is our territory");
                    }
                    j++;
                }
                if(trobat) {
                    if(territory.territory_ruler == null && check_conquer) {
                        //alert("Neutral territory");
                        //territories_info[territory._id] = {neutral: true, enemy: false, own: false};
                        territories_info[i].neutral = true;
                        drawContouredImage(i);
                    } else if(territory.territory_ruler != null && ((territory.territory_level == 1 && check_attack_lvl1) || (territory.territory_level == 2 && check_attack_lvl2) || (territory.territory_level == 3 && check_attack_lvl3))) {
                        //alert("Enemy territory");
                        //territories_info[territory._id] = {neutral: false, enemy: true, own: false};
                        territories_info[i].enemy = true;
                        drawContouredImage(i);
                    } else {
                        //alert("Non clicable territory");
                        //territories_info[territory._id] = {neutral: false, enemy: false, own: false};
                        territories_info[i] = {neutral: false, enemy: false, own: false};
                    }
                } else {
                    //alert("Non clicable territory");
                    //territories_info[territory._id] = {neutral: false, enemy: false, own: false};
                    territories_info[i] = {neutral: false, enemy: false, own: false};
                }
            }

//             alert("Territory " + (i+1));
//
//            var trobat = false;
//            var j = 0;
//            alert("Checking neighbours");
//            while(!trobat && j < territory.territory_neighbours.length) {
//                alert("Neighbour territory " + territory.territory_neighbours[j]);
//                if(game.game_territories[territory.territory_neighbours[j] - 1].territory_ruler == game.game_turn) {
//                    trobat = true;
//                    alert("Neighbour is our territory");
//                }
//                j++;
//            }
//            if(trobat && check_conquer) {
//                alert("Neutral territory");
//                territories_info[territory._id] = {neutral: true, enemy: false, own: false};
//                //Actualitzar imatge per mostrar que es neutral
//            } else if(territory.territory_ruler == game.game_turn && check_update) {
//                alert("Own territory");
//                territories_info[territory._id] = {neutral: false, enemy: false, own: true};
//                //Actualitzar imatge per mostrar que es pot actualitzar
//            } else if(trobat && ((territory.territory_level == 1 && check_attack_lvl1) || (territory.territory_level == 2 && check_attack_lvl2) || (territory.territory_level == 3 && check_attack_lvl3))) {
//                alert("Enemy territory");
//                territories_info[territory._id] = {neutral: false, enemy: true, own: false};
//                //Actualitzar imatge per mostrar que es atacable
//            } else {
//                alert("Non clicable territory");
//                territories_info[territory._id] = {neutral: false, enemy: false, own: false};
//            }
        }
        //alert("Territories info:/n " + territories_info);
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

    stage.add(layer);

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




function drawFilledImage(imageObj, player_id) {

    //    layer.removeChildren();
    //    kinetic_images[9].getImage().src = '/images/territories/filled/player1/territory10.png';

    //alert(JSON.stringify(image));
    //alert(player_id);

    filled_layers[imageObj.index].removeChildren();
    //kinetic_images[index].getImage().src = '/images/territories/filled/player1/territory' + (index+1) + '.png';

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
            //layer.draw();
            filled_layers[this.attrs.index].draw();
            showTerritoryInformation(this);
        });
        kin_img.on('mouseout', function() {
            $('#test').val('');
            this.setOpacity(1);
            $('#container').css('cursor','auto')
            //layer.draw();
            filled_layers[this.attrs.index].draw();
            hideTerritoryInformation();
        });
        kin_img.on('click', function() {
            //action(this.attrs.id);
            action(this);
        });

        kin_img.createImageHitRegion(function() {
            //layer.draw();
            filled_layers[this.attrs.index].draw();
        });

        filled_layers[imageObj.index].add(kin_img);
        filled_layers[imageObj.index].draw();
    };
    img.src = '/images/territories/filled/player' + player_id + '/territory' + (imageObj.index+1) + '.png';
};

function drawContouredImage(index) {

    //    layer.removeChildren();
    //    kinetic_images[9].getImage().src = '/images/territories/filled/player1/territory10.png';

    //alert(JSON.stringify(image));
    //alert(player_id);

    //contour_layers[index].removeChildren();
    //kinetic_images[index].getImage().src = '/images/territories/filled/player1/territory' + (index+1) + '.png';

    var img = new Image();
    img.onload = function() {
        var kin_img = new Kinetic.Image({
            image: img,
            x: 150,
            y: 125
        });

        kin_img.createImageHitRegion(function() {
            //layer.draw();
            contour_layers[index].draw();
        });

        contour_layers[index].add(kin_img);
        contour_layers[index].draw();

        stage.add(contour_layers[index]);
    };
    img.src = '/images/territories/contoured/player' + player_id + '/territory' + (index+1) + '.png';
};



var imagesDir = '/images/territories/neutral/';
var images = {};
var loadedImages = 0;
for (var src in sources) {
    images[src] = new Image();
    images[src].onload = function() {
        if (++loadedImages >= num_images) {
            //initStage(images);
            initStage();
        }
    };
    images[src].src = imagesDir + sources[src];
}



var kinetic_images = [];

var filled_layers = [];
var contour_layers = [];
var thief_layer = new Kinetic.Layer();

for (var i = 0; i < 42; i++) {
    filled_layers.push(new Kinetic.Layer());
    contour_layers.push(new Kinetic.Layer());
}

//function initStage(images) {
function initStage() {
    //var kinetic_images = [];
    for (var i = 0; i < num_images; i++) {
        kinetic_images[i] = new Kinetic.Image({
            image: images[i],
            desc: sources[i],
            id: ids[i],
            index: i,
            width: images[i].width,
            height: images[i].height,
            x: 150,
            y: 125
        });

        kinetic_images[i].on('mouseover', function() {
            //alert(JSON.stringify(this.getAttrs()));
            $('#test').val(this.getAttrs().desc);
            this.setOpacity(0.3);
            $('#container').css('cursor','pointer')
            //layer.draw();
            filled_layers[this.getAttrs().index].draw();
            showTerritoryInformation(this);
        });
        kinetic_images[i].on('mouseout', function() {
            $('#test').val('');
            this.setOpacity(1);
            $('#container').css('cursor','auto')
            //layer.draw();
            filled_layers[this.getAttrs().index].draw();
            hideTerritoryInformation();
        });
        kinetic_images[i].on('click', function() {
            //action(this.attrs.id);
            action(this);
        });

        kinetic_images[i].createImageHitRegion(function() {
            //layer.draw();
            filled_layers[this.getAttrs().index].draw();
        });

        //layer.add(kinetic_images[i]);
        filled_layers[i].add(kinetic_images[i]);

        stage.add(filled_layers[i]);
    }
    //stage.add(layer);
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