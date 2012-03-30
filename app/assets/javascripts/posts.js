$(function() {
	// Auto-expanding height for editor textareas
	var title = document.getElementById('text-title'),
	    content = document.getElementById('text-content');


	$('.post').fitVids();

	// If we're on the edit page
	if (title) {
		// Auto expanding textareas.  See _functions.js
		makeExpandingArea(title);
		makeExpandingArea(content);

		// Scroll window if we edit long posts
		$('#post_content').bind('keyup', function() {
			var $this = $(this),
			    bottom = $this.offset().top + $this.height();

			if (bottom > $(window).scrollTop() &&
				$this.prop("selectionStart") > ($this.val().length - $this.val().split('\n').slice(-1)[0].length)) {
				$(window).scrollTop(bottom);
			}
		});

		// Set minimum height of content textarea
		$('#post_content').css('min-height', $(window).height() - $('#post_title').height() - 130);

		// Autosave
		// setInterval(function(){
		//   var form = $('.edit_post'),
		//       action = form.attr('action');

		//   $.post(action, form.serialize(), function(data){
		//   	$('body').prepend('<span>Saved!</span>');
		//   });
		// },10000);

		// Preview pops open new window
		var $form = $('form:first'),
				original_action = $form.attr('action');
		$('#preview-button').click(function(e) {
			if (validateTitle()) {
				$form.attr('action', '/preview');
	    	$form.attr('target', '_blank');
	    	$form.submit();
	    } else {
	    	e.preventDefault();
	    }
		});

		// Save button validates
		$('#save-button').click(function(e) {
  		if (validateTitle()) {
      	$form.attr('target', '_self');
      	$form.attr('action', original_action);
      	$form.submit();
      } else {
      	e.preventDefault();
      }
		});

		// Options menu
		$('.menu').toggle(function(){
			$(this).addClass('active');
			$($(this).attr('href')).addClass('visible');
		}, function() {
			$(this).removeClass('active');
			$($(this).attr('href')).removeClass('visible');
		});

		// Fade out save post notice
		$('.notice').delay(2000).fadeOut(500);
	}
});