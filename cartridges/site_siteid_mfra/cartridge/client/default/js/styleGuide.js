$(document).ready(function () {
    var body = $('html, body');

    $('a[href*=\\#]').on('click', function (event) {
        event.preventDefault();
        body.animate({ scrollTop: $(this.hash).offset().top }, 500);
    });
});
