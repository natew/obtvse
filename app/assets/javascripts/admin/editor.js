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
	var title          = document.getElementById('text-title'),
	    content        = document.getElementById('text-content'),
	    published      = $('#published'),
	    drafts         = $('#drafts'),
	    preview        = false,
	    changed        = false,
	    editing        = false,
	    saveInterval   = 5000,
	    draftsItems    = $('#drafts ul').data('items'),
	    publishedItems = $('#published ul').data('items'),
	    selectedItem   = $('.col li:visible:first'),
	    selectedIndex  = 0,
	    selectedCol    = 0;

	function selectItem(selector) {
		selectedItem.removeClass('selected');
		selectedItem = selector.addClass('selected');
	}

	function setEditing(val) {
		editing = val;
		editing ? $('#admin').addClass('editing') : $('#admin').removeClass('editing');
	}

	function editSelectedItem() {
		setEditing(true);
		var id = selectedItem.attr('id').split('-')[1];
		$.get('/get/'+id, function(data) {
			$('#new_post').attr('action', '/edit/'+id);
			$('#post_title').val(selectedItem.find('a').html());
			$('#post_content').val(data);
		});
	}

	function selectCol(col) {
		selectedCol = col;
		if (selectedCol == 0) {
			published.removeClass('active');
			drafts.addClass('active');
		} else {
			drafts.removeClass('active');
			published.addClass('active');
		}
	}

	// Highlight items in list
	selectItem($('.col li:visible:first'));

	// Auto expanding textareas.  See _functions.js
	makeExpandingArea(title);
	makeExpandingArea(content);

	// Filtering and other functions with the title field
	$('#post_title').focus().keyup(function(e) {
		if (!editing) {
			// Selecting
			if (selectedItem.length == 0 || selectedItem.is('.hidden')) {
				console.log('reset');
				selectItem($('.col li:visible:first'));
				selectedIndex = 0;
			}

			// Filtering
			var val = $(this).val();
			if (val) {
				var	draft_ids = filterTitle(draftsItems,val).join(',#post-'),
					  pub_ids   = filterTitle(publishedItems,val).join(',#post-');

				draft_ids ? showOnly('#drafts li', '#post-'+draft_ids) : $('#drafts li').addClass('hidden');
				pub_ids   ? showOnly('#published li', '#post-'+pub_ids) : $('#published li').addClass('hidden');
				(!draft_ids && !pub_ids) ? $('#admin').addClass('editing') : $('#admin').removeClass('editing');
			} else {
				$('#drafts li,#published li').removeClass('hidden');
			}
		}
	}).keydown(function(e) {
		if (!editing) {
			switch (e.which) {
				// Esc
				case 27:
					e.preventDefault();
					$('#post_title').val('');
					$('#drafts li,#published li').removeClass('hidden');
					break;
			}
		}
	});

	// Movement on columns
	$(window).keydown(function(e) {
		console.log(e.which);
		if (!editing) {
			switch (e.which) {
				// Enter
				case 13:
					e.preventDefault();
					if (selectedItem.length > 0) {
						editSelectedItem();
					}
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
					if (selectedCol == 0) {
						var item = $('#published li:visible:first');
						if (item) {
							selectItem(item);
							selectCol(1);
							selectedIndex = 0;
						}
					}
					break;
				// Left
				case 37:
					e.preventDefault();
					if (selectedCol == 1) {
						var item = $('#drafts li:visible:first');
						if (item) {
							selectItem(item);
							selectCol(0);
							selectedIndex = 0;
						}
					}
					break;
			}
		}
		// Editing
		else {
			switch (e.which) {
				// Enter
				case 27:
					e.preventDefault();
					setEditing(false);
					break;
			}
		}
	});

	// Edit a post on click
	$('.col a').click(function(e) {
		e.preventDefault();
		selectItem($(this).parent().parent());
		editSelectedItem();
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
		if (editing && changed) {
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