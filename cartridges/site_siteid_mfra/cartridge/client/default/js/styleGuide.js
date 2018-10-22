$(document).ready(function () {
    var sidenav = $('.sg-sidenav');
    var body = $('html, body');
    var currentWidth = $(window).width();
    var mobileView = 576;

    $(window).resize(function () {
        location.reload();
    });

    $('.sg-sidenav a[href*=\\#]').on('click', function (event) {
        event.preventDefault();
        if (currentWidth < mobileView) {
            body.animate({ scrollTop: $(this.hash).offset().top - sidenav.height() }, 500);
        } else {
            body.animate({ scrollTop: $(this.hash).offset().top }, 500);
        }
    });
});
