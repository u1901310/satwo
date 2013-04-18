/**
 * Created with JetBrains WebStorm.
 * User: XiBi
 * Date: 11/04/13
 * Time: 17:26
 * To change this template use File | Settings | File Templates.
 */

if (user != null) $('#main_username').text($('#main_username').text() + user.username);

//TODO: Recarregar les sol·licituds i amics automàticament quan s'afegeixen
reload_requests();
reload_friends();

var add_friend_button_behaviour = function(){
    if (user.username != $('#friend_username').val()) {
        var info = $.getJSON('userByUsername/' + $('#friend_username').val(), function(data) {
            if(data.result == "ok") {
                $.post('/sendRequest',
                    {
                        user: user.username,
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
    $('#requests_list').html('');

    var info = $.getJSON('getRequests/' + user.username, function(data) {
        if(data != null) {
            jQuery.each(data.requests, function(){
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
    $('#friends_list').html('');

    var info = $.getJSON('getFriends/' + user.username, function(data) {
        if(data != null) {
            jQuery.each(data.friends, function(){
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
                user: user.username,
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
    if (user.username != name) {
        var info = $.getJSON('userByUsername/' + name, function(data) {
            if(data.result == "ok") {
                $.post('/addFriend',
                    {
                        user: user.username,
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
            user: user.username,
            friend: name
        },
        function(data,status){

        },
        "json"
    );

    reload_requests();
};