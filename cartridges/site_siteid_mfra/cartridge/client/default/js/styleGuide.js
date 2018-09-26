$(document).ready(function () {
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 120) {
            $('.sidenav').addClass('fixed');
        } else {
            $('.sidenav').removeClass('fixed');
        }
    });
});
