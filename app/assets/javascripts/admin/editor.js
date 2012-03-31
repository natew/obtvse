$(function() {
	// Auto-expanding height for editor textareas
	var title        = document.getElementById('text-title'),
	    content      = document.getElementById('text-content'),
	    preview      = false,
	    saveInterval = 5000;

	// If we're on the edit page
	if (title) {
		var changed = false;

		// Auto expanding textareas.  See _functions.js
		makeExpandingArea(title);
		makeExpandingArea(content);

		// Scroll window as we edit long posts
		$('#post_content').bind('keyup', function() {
			var $this = $(this),
			    bottom = $this.offset().top + $this.height();

			if (bottom > $(window).scrollTop() &&
				$this.prop("selectionStart") > ($this.val().length - $this.val().split('\n').slice(-1)[0].length)) {
				$(window).scrollTop(bottom);
			}
		});

		// Preview button
		$('#preview-button').click(function(e){
			e.preventDefault();
			if (preview) {
				$('#split').removeClass('preview');
				preview = false;
			} else {
				updatePreview();
				$('#split').addClass('preview');
				preview = true;
			}
		});

		// Set minimum height of content textarea
		$('#post_content').css('min-height', $(window).height() - $('#post_title').height() - 130);

		// Autosave and post preview
		$('#post_content,#post_title').bind('keyup', function(){
			changed = true;
			$('#save-button').val('Save').removeClass('saved').attr('disabled','');

			if (preview) {
				updatePreview();
			}
		});

		// Autosave
		setInterval(function(){
			if (changed) {
				changed = false;
				savePost();
			}
		}, saveInterval);

		// Ajax save-button
		$('#save-button').click(function(){
			savePost();
		});

		// // Preview pops open new window
		// var $form = $('form:first'),
		// 		original_action = $form.attr('action');
		// $('#preview-button').click(function(e) {
		// 	if (validateTitle()) {
		// 		$form.attr('action', '/preview');
	 //    	$form.attr('target', '_blank');
	 //    	$form.submit();
	 //    } else {
	 //    	e.preventDefault();
	 //    }
		// });

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