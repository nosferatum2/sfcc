$(document).ready(function () {
    var sidenav = $('.sg-sidenav');
    var body = $('html, body');

    $('a[href*=\\#]').on('click', function (event) {
        event.preventDefault();
        if (sidenav.height() === 200) {
            body.animate({ scrollTop: $(this.hash).offset().top - sidenav.height() }, 500);
        } else {
            body.animate({ scrollTop: $(this.hash).offset().top }, 500);
        }
    });
});
