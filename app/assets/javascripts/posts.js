$(function() {
  $('.post').fitVids();

  $('header').addClass('transition');
  setTimeout(function(){$('header').addClass('hued')},400);

  $('#back-to-top').click(function(e) {
    e.preventDefault();
    $('body').animate({scrollTop:0});
  });
});