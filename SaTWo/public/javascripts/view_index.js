
$(document).ready(function() {
    // Clean all possible information in inputs fields
    clear_inputs('login_div');
    clear_inputs('register_div');

    var user_logged = null;
});

/*
 * Function to clean every input tag from a div
 * */
var clear_inputs = function(id) {
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