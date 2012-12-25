$(function() {
  var $body = $('body');

  $('.post').fitVids();

  $body.addClass('transition');
  setTimeout(function(){$body.addClass('change')},400);

  $('#back-to-top').click(function(e) {
    e.preventDefault();
    $body.animate({scrollTop:0});
  });

  $('header a:not(h1 a), .open-external').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'));
  });

  $body.on('click', '.modal', function(e) {
    e.preventDefault();
    var href = $(this).attr('href'),
        target = href[0] == '#' ? href : $(this).attr('data-target');

    Avgrund.show(target);
    setTimeout(function() {
      console.log($('input[type="text"]:first', target))
      $('input[type="text"]:first', target).focus().select();
    })
  });

  $body.on('click', '.modal-close, .avgrund-cover', function(e) {
    e.preventDefault();
    Avgrund.hide();
  });

  if ($body.is('.no-users')) {
    $('#blog-button').click();
  }
});