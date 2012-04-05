var showdown = new Showdown.converter();

// Allows for auto expanding textareas
function makeExpandingArea(container) {
  var area = container.querySelector('textarea'),
      span = container.querySelector('span');

 if (area.addEventListener) {
   area.addEventListener('input', function() {
     span.textContent = area.value;
   }, false);
   span.textContent = area.value;
 } else if (area.attachEvent) {
   // IE8 compatibility
   area.attachEvent('onpropertychange', function() {
     span.innerText = area.value;
   });
   span.innerText = area.value;
 }

 // Enable extra CSS
 container.className += ' active';
}

// Lets us get the caret position in textarea
function getCaret(el) {
  if (el.selectionStart) {
    return el.selectionStart;
  } else if (document.selection) {
    el.focus();

    var r = document.selection.createRange();
    if (r == null) {
      return 0;
    }

    var re = el.createTextRange(),
        rc = re.duplicate();
    re.moveToBookmark(r.getBookmark());
    rc.setEndPoint('EndToStart', re);

    return rc.text.length;
  }
  return 0;
}

function validateTitle() {
  if ($('#post_title').val() == '') {
    alert('Please enter a title');
    return false;
  } else {
    return true;
  }
}

function updatePreview() {
  $('#post-preview').html('<h1>'+$('#post_title').val()+'</h1>'+showdown.makeHtml($('#post_content').val()));
}

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

$(function() {

	// VARIABLES
			History        = window.History,
			document       = window.document,
	    title          = document.getElementById('text-title'),
	    content        = document.getElementById('text-content'),
	    published      = $('#published'),
	    drafts         = $('#drafts'),
	    admin          = $('#admin'),
	    post_title     = $('#post_title'),
	    post_content   = $('#post_content'),
	    post_slug      = $('#post_slug'),
	    post_url       = $('#post_url'),
	    post_draft     = $('#post_draft'),
	    post_form       = $('#new_post,.edit_post'),
	    preview        = false,
	    changed        = false,
	    editing        = false,
	    editingId      = null,
	    divOpacity     = 0,
	    disableNav     = false,
	    disableKeys    = [91, 16, 17, 18],
	    saveInterval   = 5000,
	    draftsItems    = $('#drafts ul').data('items'),
	    publishedItems = $('#published ul').data('items'),
	    selectedItem   = $('.col li:visible:first'),
	    selectedCol    = $('#drafts'),
	    selectedColUl  = $('#drafts ul'),
	    itemIndex      = 0,
	    colIndex       = 0,
	    cache          = {},
	    col_height     = 0,
	    divTimeout     = null,
	    curPath        = window.location.pathname.split('/');

  // Detect if we are in editing
  if (curPath.length > 2) {
  	setEditing(parseInt(curPath[2],10));
  }

	// History.js
	// Bind to StateChange Event
	History.Adapter.bind(window,'statechange',function(){
	    var State = History.getState();
	    History.log(State.data, State.title, State.url);
	});

  // FUNCTIONS

	function savePost(id) {
	  var form = $('.edit_post,#new_post'),
	      action = form.attr('action');

	  // Update cache
	  cache[id] = $('#post_content').val();

	  // POST
	  $.ajax({
	  	type: 'POST',
	  	url: action,
	  	data: form.serialize(),
	  	dataType: 'text',
	  	success: function(data) {
		    $('#save-button').val('Saved').addClass('saved').attr('disabled','disabled');

		    // If we saved for the first time
		    console.log('saved', editingId);
		    if (editingId == true) {
		    	var id, slug = data.split(',');
		    	console.log('got it', data);
		    	editingId = data;
		    	post_form.attr('action', '/edit/'+editingId);
		    	$('#post_slug').val(slug);
		    	$('#drafts ul').prepend('<li id="post-'+editingId+'"><h3><a href="">'+$('#post_title').val()+'</a></li>');
		    }
		  }
	  });
	}

	function setHeights() {
		col_height = $(window).height() - 200;
		$('.col ul').css('height', col_height);
		post_content.css('min-height', $(window).height() - post_title.height() - 70);
	}

	function selectItem(selector) {
		selectedItem.removeClass('selected');
		selectedItem = selector.addClass('selected');
	}

	function setEditing(val) {
		console.log(val);
		if (val == false) {
			editing = false;
			admin.removeClass('editing');
			post_title.val('').focus();
			post_content.val('');
		}
		else {
			editing = true;
			editingId = val;
			admin.addClass('editing');
			post_form.attr('action', '/posts');
		}
	}

	function load_post(id) {
		var url = '/edit/'+id;
		post_content.val(cache[id].content);
		post_slug.val(cache[id].slug);
		post_url.val(cache[id].url);
		post_draft.attr('checked',cache[id].draft ? 'checked' : '');
		post_form.attr('action', url);
		History.pushState(null, null, url);
	}

	function editSelectedItem() {
		var id = selectedItem.attr('id').split('-')[1];
		setEditing(id);
		post_title.val(selectedItem.find('a').html());
		// Check if post content cached else load it
		if (cache[id]) {
			load_post(id);
		} else {
			// Fetch post content
			$.getJSON('/get/'+id, function(data) {
				cache[id] = data;
				load_post(id);
			});
		}
		$('#bar div').delay(1500).animate({opacity:0});
	}

	function selectCol(col) {
		colIndex = col;
		if (colIndex == 0) {
			published.removeClass('active');
			selectedCol = drafts.addClass('active');
		} else {
			drafts.removeClass('active');
			selectedCol = published.addClass('active');
		}
		selectedColUl = selectedCol.find('ul');
	}



	// Highlight items in list
	selectItem($('.col li:visible:first'));

	// Auto expanding textareas.  See _functions.js
	makeExpandingArea(title);
	makeExpandingArea(content);

	// Animations on editing interface
	function hideDivs() { $('#bar div').animate({opacity:divOpacity}); }
	$('#bar div')
		.mouseenter(function() { clearTimeout(divTimeout); $('#bar div').stop().animate({opacity:1}); })
		.mouseleave(function() { divTimeout = setTimeout(hideDivs, 1500); console.log('leave div'); });
	$(document)
		.mouseenter(function(){ divOpacity = 0; console.log('enter window'); })
		.mouseleave(function(){ divOpacity = 1; console.log('exit window'); });

	// Filtering and other functions with the title field
	post_title.focus().keyup(function(e) {
		if (!editing) {
			// Selecting
			if (selectedItem.length == 0 || selectedItem.is('.hidden')) {
				selectItem($('.col li:visible:first'));
				itemIndex = 0;
			}

			// Filtering
			var val = $(this).val();
			if (val) {
				var	draft_ids = filterTitle(draftsItems,val).join(',#post-'),
					  pub_ids   = filterTitle(publishedItems,val).join(',#post-');

				draft_ids ? showOnly('#drafts li', '#post-'+draft_ids) : $('#drafts li').addClass('hidden');
				pub_ids   ? showOnly('#published li', '#post-'+pub_ids) : $('#published li').addClass('hidden');
				if (!draft_ids && !pub_ids) setEditing(true);
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
					post_title.val('');
					$('#drafts li,#published li').removeClass('hidden');
					break;
			}
		}
	});

	// Window keybindings
	$(window).keydown(function(e) {
		console.log(e.which);

		// Disable keyboard shortcuts for action keys
		if ($.inArray(e.which,disableKeys) >= 0) disableNav = true;

		if (!editing && !disableNav) {
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
					var next = selectedItem.siblings(':visible').eq(itemIndex);
					if (next.length > 0) {
						itemIndex++;
						selectItem(next);

						// Scroll column if necessary
						var itemOffset = selectedItem.position().top;
						console.log(itemOffset);
						if (itemOffset > (col_height/2)) {
							selectedColUl.scrollTop(selectedColUl.scrollTop()+selectedItem.height()*2);
						}
					}
					break;
				// Up
				case 38:
					e.preventDefault();
					if (itemIndex > 0) {
						var prev = selectedItem.siblings(':visible').eq(itemIndex-1);
						if (prev.length > 0) {
							itemIndex--;
							selectItem(prev);
						}
					}
					break;
				// Right
				case 39:
					if (colIndex == 0) {
						e.preventDefault();
						var item = $('#published li:visible:first');
						if (item) {
							selectItem(item);
							selectCol(1);
							itemIndex = 0;
						}
					}
					break;
				// Left
				case 37:
					if (colIndex == 1) {
						e.preventDefault();
						var item = $('#drafts li:visible:first');
						if (item) {
							selectItem(item);
							selectCol(0);
							itemIndex = 0;
						}
					}
					break;
				// Esc
				case 27:
					e.preventDefault();
					post_title.val('');
					break;
			}
		}
		// Editing
		else {
			switch (e.which) {
				// Esc
				case 27:
					e.preventDefault();
					setEditing(false);
					break;
				// Backspace
				case 8:
					if (post_title.val() == '') setEditing(false);
					break;
			}
		}
	}).keyup(function(e) {
		// Stop disable
		disableNav = false;
	});

	// Edit a post on click
	$('.col a').on('click', function(e) {
		e.preventDefault();
		selectItem($(this).parent().parent());
		editSelectedItem();
	});

	$('#new_draft').submit(function() {
		return false;
	})

	// Scroll window as we edit long posts
	// + autosave and post preview
	$('#post_content').keyup(function() {
		var $this = $(this),
		    bottom = $this.offset().top + $this.height();

		$('#save-button').val('Save').removeClass('saved').attr('disabled','');
		if (preview) updatePreview();

		if (bottom > $(window).scrollTop() &&
			$this.prop("selectionStart") > ($this.val().length - $this.val().split('\n').slice(-1)[0].length)) {
			$(window).scrollTop(bottom);
		}
	});

	// Detect if we change anything
	$('#post_draft,#post_content,#post_title,#post_slug,#post_url').on('change keyup', function(){
		changed = true;
	});

	// Back button
	$('#back-button').click(function(e) {
		e.preventDefault();
		if (editing) setEditing(false);
		History.back();
	});

	// Preview button
	$('#preview-button').click(function(e){
		e.preventDefault();
		if (preview) {
			$('#split').removeClass('preview');
			$(this).removeClass('icon-eye-close').addClass('icon-eye-open');
			preview = false;
		} else {
			updatePreview();
			$('#split').addClass('preview');
			$(this).removeClass('icon-eye-open').addClass('icon-eye-close');
			preview = true;
		}
	});

	// Set minimum height of content textarea and post lists
	setHeights();
	$(window).resize(setHeights);

	// Autosave
	setInterval(function(){
		if (editing && changed) {
			changed = false;
			savePost(editingId);
		}
	}, saveInterval);

	// Ajax save-button
	$('#save-button').click(function(e){
		e.preventDefault();
		savePost(editingId);
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