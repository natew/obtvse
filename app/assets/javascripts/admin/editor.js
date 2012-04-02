function filterTitle(objects, val) {
	return objects.filter(function(el) {
		var regex = new RegExp(val.split('').join('.*'), 'i');
		if (el.title.match(regex)) return true;
	}).map(function(el) {
		return el.id;
	});
}

function showOnly(context,selectors) {
	$(context).addClass('hidden').filter(selectors).removeClass('hidden');
}

function setHeights() {
	$('.col ul').css('height', $(window).height() - 200);
	$('#post_content').css('min-height', $(window).height() - $('#post_title').height() - 130);
}

$(function() {
	// Auto-expanding height for editor textareas
	var title         = document.getElementById('text-title'),
	    content       = document.getElementById('text-content'),
	    preview       = false,
	    changed       = false,
	    saveInterval  = 5000,
	    drafts        = $('#drafts ul').data('items'),
	    published     = $('#published ul').data('items'),
	    selectedItem  = $('.col li:visible:first'),
	    selectedIndex = 0;

	function selectItem(selector) {
		selectedItem.removeClass('selected');
		selectedItem = selector.addClass('selected');
	}

	// Highlight items in list
	selectItem($('.col li:visible:first'));

	// Auto expanding textareas.  See _functions.js
	makeExpandingArea(title);
	makeExpandingArea(content);

	// Filtering and other functions with the title field
	$('#post_title').focus().keydown(function(e) {
		console.log(e.which);
		switch (e.which) {
			// Enter
			case 13:
				e.preventDefault();
				break;
			// Down
			case 40:
				e.preventDefault();
				var next = selectedItem.siblings(':visible').eq(selectedIndex);
				if (next.length > 0) {
					selectedIndex++;
					selectItem(next);
				}
				break;
			// Up
			case 38:
				e.preventDefault();
				if (selectedIndex > 0) {
					var prev = selectedItem.siblings(':visible').eq(selectedIndex-1);
					if (prev.length > 0) {
						selectedIndex--;
						selectItem(prev);
					}
				}
				break;
			// Right
			case 39:
				e.preventDefault();
				break;
			// Left
			case 37:
				e.preventDefault();
				break;
		}
	}).keyup(function(e) {
		// Selecting
		if (selectedItem.length == 0 || selectedItem.is('.hidden')) {
			console.log('reset');
			selectItem($('.col li:visible:first'));
			selectedIndex = 0;
		}

		// Filtering
		var val = $(this).val();
		if (val) {
			var	draft_ids = filterTitle(drafts,val).join(',#post-'),
				  pub_ids   = filterTitle(published,val).join(',#post-');

			draft_ids ? showOnly('#drafts li', '#post-'+draft_ids) : $('#drafts li').addClass('hidden');
			pub_ids   ? showOnly('#published li', '#post-'+pub_ids) : $('#published li').addClass('hidden');
			(!draft_ids && !pub_ids) ? $('#admin').addClass('editing') : $('#admin').removeClass('editing');
		} else {
			$('#drafts li,#published li').removeClass('hidden');
		}
	});

	$('#new_draft').submit(function() {
		return false;
	})

	// Scroll window as we edit long posts
	$('#post_content').keyup(function() {
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

	// Set minimum height of content textarea and post lists
	setHeights();
	$(window).resize(setHeights);

	// Autosave and post preview
	$('#post_content').bind('keyup', function(){
		changed = true;
		$('#save-button').val('Save').removeClass('saved').attr('disabled','');
		if (preview) updatePreview();
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
});