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

function makeExpandingAreas() {
  makeExpandingArea(title);
  makeExpandingArea(content);
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

function filterTitle(objects, val) {
  return objects.filter(function(el) {
    var regex = new RegExp(val.split('').join('.*'), 'i');
    if (el.title.match(regex)) return true;
  }).map(function(el) {
    return el.id;
  });
}

// Scroll to bottom of content and select the end
function scrollToBottom() {
  $('#post_content').focus().putCursorAtEnd();
  $('#content-fieldset').scrollTop(post_content.height());
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
      post_form      = $('#new_post,.edit_post'),
      bar_div        = $('#bar div'),
      preview        = false,
      changed        = false,
      editing        = false,
      editingId      = null,
      disableNav     = false,
      beganEditing   = false,
      disableKeys    = [91, 16, 17, 18],
      saveInterval   = 5000,
      draftsItems    = $('#drafts ul').data('items'),
      publishedItems = $('#published ul').data('items'),
      selectedItem   = $('.col li:visible:first'),
      selectedCol    = $('#drafts'),
      selectedColUl  = $('#drafts ul'),
      itemIndex      = 0,
      colIndex       = 0,
      col_height     = 0,
      divTimeout     = null,
      curPath        = window.location.pathname.split('/'),
      showdown       = null;

  //
  // FUNCTIONS
  //

  // Get cache
  function getCache(id) {
    var string = localStorage.getItem(id);
    return JSON.parse(string);
  }

  // Set cache
  function setCache(id, data) {
    localStorage.setItem(id,JSON.stringify(data));
  }

  // Load it up
  function loadCache(id, callback) {
    $.getJSON('/get/'+id, function(data) {
      setCache(id,data);
      if (callback) callback.call();
    });
  }

  // Saves the post
  function savePost(id) {
    var form        = $('.edit_post,#new_post'),
        save_button = $('#save-button'),
        action      = form.attr('action');

    save_button.addClass('icon-refresh').removeClass('icon-asterisk');

    // POST
    $.ajax({
      type: 'POST',
      url: action,
      data: form.serialize(),
      dataType: 'text',
      success: function(data) {
        var data = JSON.parse(data);
        save_button.removeClass('icon-refresh').addClass('icon-asterisk');
        setCache(data.id, data);

        // If we saved for the first time
        if (editingId == true || editingId == null) {
          loadPost(data.id);
          $('#drafts ul').prepend('<li id="post-'+editingId+'"><a href="">'+$('#post_title').val()+'</a></li>');
        }
      }
    });
  }

  // Markdwon preview
  function updatePreview() {
    $('#post-preview').html('<h1>'+$('#post_title').val()+'</h1>'+showdown.makeHtml($('#post_content').val()));
  }

  // Hide editor buttons
  function hideBar() {
    if ($('#bar div:not(.hovered)').length > 0) bar_div.addClass('hidden');
  }

  // Set post content height and column height
  function setHeights() {
    var content_height = $(window).height() - post_title.height() - 70;
    col_height = $(window).height() - 200;
    $('.col ul').css('height', col_height);
    post_content.css('min-height', content_height);
    $('#content-fieldset').css('height', content_height);
  }

  // Highlight an item in the column
  function selectItem(selector) {
    selectedItem.removeClass('selected');
    selectedItem = selector.addClass('selected');
  }

  // Upadting interface when editing or not
  function setEditing(val) {
    makeExpandingAreas();
    if (val) {
      editing = true;
      admin.addClass('editing');
      post_title.focus();
    } else {
      editing = false;
      beganEditing = false;
      admin.removeClass('editing');
      post_title.val('').focus();
      post_content.val('');
      makeExpandingAreas();
      History.pushState(null, null, '/new');
    }
  }

  // Uses cache to fill in information
  function loadPost(id) {
    var url   = id == true ? '/new' : '/edit/'+id,
        cache = getCache(id);
    if (id != true) editingId = id;
    post_content.val(cache.content);
    post_slug.val(cache.slug);
    post_url.val(cache.url);
    post_draft.attr('checked',cache.draft ? 'checked' : '');
    post_form.attr('action', url);
    makeExpandingAreas();
    scrollToBottom();
    History.pushState(null, null, url);
  }

  // Either uses cache or loads post
  function editSelectedItem() {
    var id = selectedItem.attr('id').split('-')[1];
    setEditing(id);
    post_title.val(selectedItem.find('a').html());
    makeExpandingAreas();
    // Check if post content cached else load it
    if (getCache(id)) {
      loadPost(id);
    } else {
      loadCache(id, function(){
        loadPost(id);
      });
    }
  }

  // Highlight the proper column
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

  //
  // SETUP
  //

  // Auto expanding textareas.
  makeExpandingAreas();

  // Set minimum height of content textarea and post lists
  setHeights();
  $(window).resize(setHeights);

  // So it doesnt fade in first load, we add it after onload
  bar_div.addClass('transition');

  // Animations on editing interface
  $('#bar div')
    .mouseenter(function() { bar_div.addClass('hovered').removeClass('hidden'); })
    .mouseleave(function() { bar_div.removeClass('hovered').addClass('hidden'); });

  // Detect if we are editing initially
  if (curPath.length > 2) {
    var id = parseInt(curPath[2],10);
    setEditing(id);
    loadCache(id);
    beganEditing = true;
    post_form.attr('action', '/edit/'+id);
    scrollToBottom();
    setTimeout(hideBar,1500);
  } else {
    post_title.focus();
  }

  // Select first item
  selectItem($('.col li:visible:first'));

  // Filtering and other functions with the title field
  post_title.keyup(function(e) {
    if (!editing) {
      // Selecting
      if (selectedItem.length == 0 || selectedItem.is('.hidden')) {
        selectItem($('.col li:visible:first'));
        itemIndex = 0;
      }

      // Filtering
      var val = $(this).val();
      if (val) {
        var  draft_ids = filterTitle(draftsItems,val).join(',#post-'),
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

  // Window click + keybindings
  $(window).click(function(e){
    if (!editing) {
      post_title.focus();
    }
  }).keydown(function(e) {
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

              // Scroll column if necessary
              var itemOffset = selectedItem.position().top;
              if (itemOffset < (col_height/2)) {
                selectedColUl.scrollTop(selectedColUl.scrollTop()-selectedItem.height()*2);
              }
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
        // Tab
        case 9:
          beganEditing = true;
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
    selectItem($(this).parent());
    editSelectedItem();
  });

  $('#new_draft').submit(function() {
    return false;
  })

  // Post preview
  $('#post_content,#post_title').change(function() {
    if (preview) updatePreview();
  });

  // Detect if we change anything for auto-save
  $('#post_draft,#post_content,#post_title,#post_slug,#post_url').on('change input', function(){
    // beganEditing prevents from saving just anything thats type in the title box
    // Until focus is set on the content, it will be false
    if (beganEditing) changed = true;
  });

  // Back button
  $('#back-button').click(function(e) {
    e.preventDefault();
    if (editing) setEditing(false);
    selectItem($('.col li:visible:first'));
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

  // Options menu
  $('.menu').toggle(function(){
    $(this).addClass('active');
    $($(this).attr('href')).addClass('visible');
  }, function() {
    $(this).removeClass('active');
    $($(this).attr('href')).removeClass('visible');
  });

  // Fade out notices
  $('.notice').delay(2000).fadeOut(500);

  // Initialize showdown
  showdown = new Showdown.converter();

  // History.js Bind to StateChange Event
  History.Adapter.bind(window,'statechange',function(){
      var State = History.getState();
      History.log(State.data, State.title, State.url);
  });
});