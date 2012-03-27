$(function() {
	// Auto-expanding height for editor textareas
	var title = document.getElementById('text-title'),
	    content = document.getElementById('text-content');

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
		var form = document.getElementsByTagName('form')[0];
		document.getElementById('preview-button').onclick = function() {
	    form.target = '_blank';
		}
		document.getElementById('save-button').onclick = function() {
	    form.target = '_self';
		}

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