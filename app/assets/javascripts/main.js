$(function() {
  var $body = $('body'),
      $html = $('html');

  pageActions();

  $(document).on('page:load', function() {
    pageActions();
  });

  $html.addClass('transition');
  setTimeout(function(){$html.addClass('change')},400);

  $('#back-to-top').click(function(e) {
    e.preventDefault();
    $('html,body').animate({scrollTop:0});
  });

  // Modals
  Avgrund = Avgrund();
  var lastModalTarget;

  $html
    .on('click', '.modal', function(e) {
      e.preventDefault();
      var href = $(this).attr('href'),
          target = href[0] == '#' ? href : $(this).attr('data-target');

      lastModalTarget = target;
      Avgrund.show(target);
      $('body,html').animate({scrollTop: 0});
      $('input[type="text"]:first', target).focus().select();
    })

    .on('click', '.modal-close, .avgrund-cover', function(e) {
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

  function pageActions() {
    $('.post').fitVids();

    prettyPrint();

    $('.open-external, a[href^="http://"]').click(function(e) {
      e.preventDefault();
      window.open($(this).attr('href'));
    });

    if ($body.is('.no-users')) {
      $('#blog-button').click();
    }
  }
});