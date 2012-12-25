$(function() {
  $('.post').fitVids();

  $('body').addClass('transition');
  setTimeout(function(){$('body').addClass('change')},400);

  $('#back-to-top').click(function(e) {
    e.preventDefault();
    $('body').animate({scrollTop:0});
  });

  $('.open-external').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'));
  })
});