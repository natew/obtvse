$(function() {
  var $body = $('body');

  $('.post').fitVids();

  $body.addClass('transition');
  setTimeout(function(){$body.addClass('change')},400);

  $('#back-to-top').click(function(e) {
    e.preventDefault();
    $('html,body').animate({scrollTop:0});
  });

  $('header a:not(h1 a), .open-external').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'));
  });

  // Modals
  Avgrund = Avgrund();
  var lastModalTarget;

  $body.on('click', '.modal', function(e) {
    e.preventDefault();
    var href = $(this).attr('href'),
        target = href[0] == '#' ? href : $(this).attr('data-target');

    lastModalTarget = target;
    Avgrund.show(target);
    $('body,html').animate({scrollTop: 0});
    $('input[type="text"]:first', target).focus().select();
  });

  $body.on('click', '.modal-close, .avgrund-cover', function(e) {
    e.preventDefault();
    Avgrund.hide();
  });

  $(document)
    .on('avgrund:show', function() {
      window.location.hash = lastModalTarget;
    }).on('avgrund:hide', function() {
      window.location.hash = '';
      window.history.replaceState('http://' + window.location.host + '/', document.title, null);
    });

  if ($body.is('.no-users')) {
    $('#blog-button').click();
  }
});