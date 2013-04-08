/**
 * Created with JetBrains WebStorm.
 * User: Eddard
 * Date: 4/04/13
 * Time: 18:24
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function() {
    //Clean all possible information in inputs fields
    clear_inputs('login_div');
    clear_inputs('register_div');
    $('#register_div').hide();

    $('#button_register').click(function() {
        $('#login_div').hide();
        $('#register_div').show();
        clear_inputs('login_div');
    });

    $('#button_register_cancel').click(function() {
        $('#register_div').hide();
        $('#login_div').show();
        clear_inputs('register_div');
    });
});

/*
 * Function to clean every input tag from a div
 * */
var clear_inputs = function (id) {
    $('#' + id + ' input').each(function () {
        if ($(this).is("input")) {
            switch (this.type) {
                case 'password':
                case 'select-multiple':
                case 'select-one':
                case 'email':
                case 'text':
                case 'textarea':
                    $(this).val('');
                    break;
                case 'checkbox':
                case 'radio':
                    this.checked = false;
            }
        }
    });
};
