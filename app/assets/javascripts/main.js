$(function() {
  var $html = $('html');

  $html.addClass('transition');
  setTimeout(function(){$html.addClass('change')},400);

  // Modals
  Avgrund = Avgrund();
  var lastModalTarget;

  // Bind to HTML (turbolinks replaces body on each click)
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
    })

    .on('click', '#back-to-top', function(e) {
      e.preventDefault();
      $('html,body').animate({scrollTop:0});
    });

  $(document)
    .on('avgrund:show', function() {
      window.location.hash = lastModalTarget;
    })
    .on('avgrund:hide', function() {
      window.location.hash = '';
      window.history.replaceState('http://' + window.location.host + '/', document.title, null);
    });

  pageActions();
  $(document).on('page:load', pageActions);

  function pageActions() {
    prettyPrint();

    $('.open-external, a[href^="http://"]').click(function(e) {
      e.preventDefault();
      window.open($(this).attr('href'));
    });

    if ($('body').is('.no-users')) {
      $('#blog-button').click();
    }
  }
});