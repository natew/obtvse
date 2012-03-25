$(function() {
	// Auto-expanding height for editor textareas
	var areas = document.querySelectorAll('.expandingArea');
	var l = areas.length;

	while (l--) {
	  makeExpandingArea(areas[l]);
	}

	// Set minimum height of content textarea
	$('#post_content').css('min-height', $(window).height() - $('#post_title').height() - 130);
});