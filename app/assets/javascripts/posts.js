$(function() {
	$('.post').fitVids();

  var printGist = function(gist) {
      console.log(gist.repo, ' (' + gist.description + ') :');
      console.log(gist.div);
  };

  var displayGist = function(selector, gistResponse) {
    $(selector).html(gistResponse.div);
  };

  // TODO: bad, don't add functions to jQuery
  $.getGist = function(id, success) {
    $.ajax({
          url: 'https://gist.github.com/' + id + '.json',
          dataType: 'jsonp',
          success: function(gist) {
            success("#" + id, gist);
          }
      });
  };

  // fetch the gists
  $('.gist').each(function() {
    $.getGist(this.id, displayGist);
  });

});