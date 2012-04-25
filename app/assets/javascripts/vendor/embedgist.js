$(document).ready(function() {
    $('.gist').each(function(i) {
        writeCapture.html(this, '<script src="'+$(this).text()+'.js"></script>');
    });
});