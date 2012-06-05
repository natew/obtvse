
//= require jquery.ui.widget
//= require jquery.fileupload
//= require jquery.fileupload-ui
//= require jquery.iframe-transport

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

    //$('#fileupload').fileupload();

    $('#fileupload').fileupload({
	add: function(e, data){
	    $('#upload-status').html("Uploading...");
	    var jqXHR = data.submit()
	        .success(function(result, textStatus, jqXHR){
		    var text = $('#post_content').val();
		    console.log(text);
		    $('#upload-status').html("Complete.");
		    $('#post_content').val(text + '![alt text](' + result + ' "Title")');
		    $('#upload-status').html("");
		})
	        .error(function(jqXHR, textStatus, errorThrown){
		})
	        .complete(function(result, textStatus, jqXHR){
		})
	}
    });

});