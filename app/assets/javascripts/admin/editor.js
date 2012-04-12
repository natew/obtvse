$(function() {
  // Elements
  el = fn.getjQueryElements({
    published : '#published',
    drafts    : '#drafts',
    admin     : '#admin',
    title     : '#post_title',
    content   : '#post_content',
    slug      : '#post_slug',
    url       : '#post_url',
    draft     : '#post_draft',
    save      : '#save-button',
    form      : '#new_post,.edit_post',
    bar       : '#bar',
    curCol    : '#drafts',
    curColUl  : '#drafts ul',
    curItem   : '.col li:visible:first',
    blog      : '#blog-button',
    publish   : '#publish-button'
  });

  // Editor state variables
  state = {
    id           : null,
    post         : null,
    preview      : false,
    changed      : false,
    editing      : false,
    navDisable   : false,
    beganEditing : false,
    barHidden    : false,
    lastKey      : 0
  };

  // VARIABLES
      History        = window.History,
      document       = window.document,
      text_title     = document.getElementById('text-title'),
      text_content   = document.getElementById('text-content'),
      disableKeys    = [91, 16, 17, 18],
      saveInterval   = 1000,
      draftsItems    = $('#drafts ul').data('items'),
      publishedItems = $('#published ul').data('items'),
      itemIndex      = 0,
      colIndex       = 0,
      col_height     = 0,
      divTimeout     = null,
      curPath        = window.location.pathname.split('/'),
      showdown       = null;


  //
  // DEBUG
  //
  setInterval(heartbeatLogger, 10000);


  //
  // FUNCTIONS
  //

  // Saves the post
  function savePost() {
    var form        = $('.edit_post,#new_post'),
        save_button = $('#save-button'),
        action      = form.attr('action');

    el.save.addClass('saving');

    // POST
    fn.log('Saving...');
    $.ajax({
      type: 'POST',
      url: action,
      data: form.serialize(),
      dataType: 'text',
      success: function(data) {
        var data = JSON.parse(data),
            li   = $('#post-'+data.id);

        // Update save button
        el.save.removeClass('saving dirty').addClass('saved');
        setTimeout(function saveButtonComplete(){el.save.removeClass('saved')},1000);

        // Update cache
        setCache(data.id, data);

        // Move to beginning of list
        li.prependTo(li.parent());

        // If we saved for the first time
        if (state.id == true || state.id == null) {
          loadPost(data.id);
          $('#drafts ul').prepend('<li id="post-'+state.id+'"><a href="">'+el.title.val()+'</a></li>');
        }
        fn.log('Saved',data.id,data);
      }
    });
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
  el.bar.addClass('transition');

  // Animations on editing interface
  el.bar
    .mouseenter(function barMouseEnter() { el.bar.addClass('hovered').removeClass('hidden'); })
    .mouseleave(function barMouseLeave() { el.bar.removeClass('hovered').addClass('hidden'); });

  // Detect if we are editing initially
  if (curPath.length > 2) {
    var id = parseInt(curPath[2],10);
    loadCache(id, function editLoadCache() {
      loadPost(id);
      setEditing(id);
      state.beganEditing = true;
      el.form.attr('action', '/edit/'+id);
      scrollToBottom();
    });
  } else {
    el.title.focus();
  }

  // Select first item
  selectItem($('.col li:visible:first'));

  // Filtering and other functions with the title field
  el.title.keyup(function titleKeyup(e) {
    if (!state.editing) {
      // Selecting
      if (el.curItem.length == 0 || el.curItem.is('.hidden')) {
        selectItem($('.col li:visible:first'));
        itemIndex = 0;
      }

      // Filtering
      var val = $(this).val();
      if (val) {
        var draft_ids = filterTitle(draftsItems,val).join(',#post-'),
            pub_ids   = filterTitle(publishedItems,val).join(',#post-');

        draft_ids ? showOnly('#drafts li', '#post-0,#post-'+draft_ids) : $('#drafts li').addClass('hidden');
        pub_ids   ? showOnly('#published li', '#post-'+pub_ids) : $('#published li').addClass('hidden');
        if (!draft_ids && !pub_ids) setEditing(true);
      } else {
        $('#drafts li,#published li').removeClass('hidden');
      }
    }
  }).keydown(function titleKeydown(e) {
    if (!state.editing) {
      switch (e.which) {
        // Esc
        case 27:
          e.preventDefault();
          el.title.val('');
          $('#drafts li,#published li').removeClass('hidden');
          break;
      }
    }
  });

  // Window click
  $(window).click(function windowClick(e){
    if (!state.editing) {
      el.title.focus();
    } else {
      if (!state.barHidden) delayedHideBar();
    }

  // Window keybord shortcuts
  }).keydown(function windowKeydown(e) {
    fn.log(e.which);

    // Not editing
    if (!state.editing) { //!$.inArray(state.lastKey,disableKeys)
      switch (e.which) {
        // Enter
        case 13:
          e.preventDefault();
          if (el.curItem.length > 0) {
            editSelectedItem();
          }
          break;
        // Down
        case 40:
          e.preventDefault();
          var next = el.curItem.siblings(':visible').eq(itemIndex);
          if (next.length > 0) {
            itemIndex++;
            selectItem(next);

            // Scroll column if necessary
            var itemOffset = el.curItem.position().top;
            if (itemOffset > (col_height/2)) {
              el.curColUl.scrollTop(el.curColUl.scrollTop()+el.curItem.height()*2);
            }
          }
          break;
        // Up
        case 38:
          e.preventDefault();
          if (itemIndex > 0) {
            var prev = el.curItem.siblings(':visible').eq(itemIndex-1);
            if (prev.length > 0) {
              itemIndex--;
              selectItem(prev);

              // Scroll column if necessary
              var itemOffset = el.curItem.position().top;
              if (itemOffset < (col_height/2)) {
                el.curColUl.scrollTop(el.curColUl.scrollTop()-el.curItem.height()*2);
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
          el.title.val('');
          break;
      }
    }
    // Editing
    else {
      if (!state.barHidden) delayedHideBar();
      switch (e.which) {
        // Esc
        case 27:
          e.preventDefault();
          if (state.preview) hidePreview();
          else setEditing(false);
          break;
        // Backspace
        case 8:
          if (el.title.val() == '') setEditing(false);
          break;
        // S
        case 83:
          // If lastkey is Command
          if (state.lastKey == 91) {
            e.preventDefault();
            savePost();
          }
          break;
      }

      state.lastKey = e.which;
    }
  }).keyup(function windowKeyup(e) {
    // Stop disable
    state.navDisable = false;
  });

  // Edit a post on click
  $('.col a').on('click', function colAClick(e) {
    e.preventDefault();
    selectItem($(this).parent());
    editSelectedItem();
  });

  el.content.focus(function contentFocus() {
    state.beganEditing = true;
  });

  // Post preview
  $('#post_content,#post_title').on('input',function postInput() {
      if (state.preview) updatePreview();
    });

  // DOMSubtreeModified detects when the text pre changes size,
  // so we can adjust the height of the other text areas
  $('#text-title pre').on('DOMSubtreeModified', function textTitleModified() {
    fn.log(setHeights());
  });

  // Detect if we change anything for auto-save
  $('#post_content,#post_title,#post_slug,#post_url').on('change input', function(){
    // beganEditing prevents from saving just anything thats type in the title box
    // Until focus is set on the content, it will be false
    if (state.beganEditing) {
      state.changed = true;
      el.save.addClass('dirty');
    }
  });

  // Back button
  $('#back-button').click(function backButtonClick(e) {
    e.preventDefault();
    fn.log('Press back button');
    if (state.editing) setEditing(false);
    selectItem($('.col li:visible:first'));
  });

  // Preview
  $('#preview-button').click(function previewButtonClick(e){
    e.preventDefault();
    if (state.preview) hidePreview();
    else showPreview();
  });

  // Publish
  el.publish.click(function publishClick(e) {
    e.preventDefault();
    state.post.draft = !state.post.draft;
    setDraft(state.post.draft);
    savePost();
  })

  el.bar.click(function barClick(e) {
    if (state.preview && e.target.id == 'bar') hidePreview();
  })

  // Autosave
  setInterval(function autoSave(){
    if (state.editing && state.changed) {
      state.changed = false;
      savePost();
    }
  }, saveInterval);

  // Ajax save-button
  $('#save-button').click(function saveButtonClick(e){
    e.preventDefault();
    savePost();
  });

  // Fade out notices
  $('.notice').delay(2000).fadeOut(500);

  // Initialize showdown
  showdown = new Showdown.converter();

  // History.js Bind to StateChange Event
  History.Adapter.bind(window,'statechange',function windowStateChange(){
    var State = History.getState();
    //History.log(State.data, State.title, State.url);
  });

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
    $.getJSON('/get/'+id, function loadCacheCallback(data) {
      setCache(id,data);
      state.post = data;
      if (callback) callback.call();
    });
  }

  // Allows for auto expanding textareas
  function makeExpandingArea(container) {
    var area = container.querySelector('textarea'),
        span = container.querySelector('span');

   if (area.addEventListener) {
     area.addEventListener('input', function makeExpandingAreaCallback() {
       span.textContent = area.value;
     }, false);
     span.textContent = area.value;
   } else if (area.attachEvent) {
     // IE8 compatibility
     area.attachEvent('onpropertychange', function makeExpandingAreaCallback() {
       span.innerText = area.value;
     });
     span.innerText = area.value;
   }

   // Enable extra CSS
   container.className += ' active';
  }

  function makeExpandingAreas() {
    makeExpandingArea(text_title);
    makeExpandingArea(text_content);
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

  function filterTitle(objects, val) {
    return objects.filter(function filterTitleObjects(el) {
      var regex = new RegExp(val.split('').join('.*'), 'i');
      if (el.title.match(regex)) return true;
    }).map(function filterTitleMap(el) {
      return el.id;
    });
  }

  // Scroll to bottom of content and select the end
  function scrollToBottom() {
    el.content.focus().putCursorAtEnd();
    $('#content-fieldset').scrollTop(el.content.height());
  }

  function showOnly(context,selectors) {
    $(context).addClass('hidden').filter(selectors).removeClass('hidden');
  }

  // Markdwon preview
  function updatePreview() {
    $('#post-preview').html('<h1>'+el.title.val()+'</h1>'+showdown.makeHtml(el.content.val()));
  }


  // Hide bar after delay
  function delayedHideBar() {
    state.barHidden = true;
    setTimeout(hideBar,1500);
  }

  // Set post content height and column height
  function setHeights() {
    var content_height = Math.max($(window).height() - el.title.height()-40,100);
    col_height = $(window).height() - 120;
    $('.col ul').css('height', col_height);
    el.content.css('min-height', content_height);
    $('#content-fieldset').css('height', content_height);
    return col_height;
  }

  // Highlight an item in the column
  function selectItem(selector) {
    el.curItem.removeClass('selected');
    el.curItem = selector.addClass('selected');
  }

  // Upadting interface when editing or not
  function setEditing(val) {
    fn.log('Set editing', val);
    state.id = val;
    if (val) {
      state.editing = true;
      el.admin.addClass('editing');
      el.bar.removeClass('hidden');
      el.blog.attr('href',window.location.protocol+'//'+window.location.host+'/'+state.post.slug);
      el.title.focus();
    }
    else {
      if (state.changed) savePost();
      state.editing = false;
      state.beganEditing = false;
      hideBar();
      el.blog.attr('href',window.location.host);
      el.admin.removeClass('preview editing');
      el.title.val('').focus();
      el.content.val('');
      History.pushState(null, null, '/new');
    }
    makeExpandingAreas();
  }

  // Uses cache to fill in information
  function loadPost(id) {
    var url = id == true ? '/new' : '/edit/'+id;
    if (id != true) {
      state.id = id;
      fn.log('loading post',id,state.post);
    }

    el.content.val(state.post.content);
    el.slug.val(state.post.slug);
    el.url.val(state.post.url);
    setDraft(state.post.draft);
    el.form.attr('action', url);
    makeExpandingAreas();
    scrollToBottom();
    History.pushState(null, null, url);
  }

  // Either uses cache or loads post
  function editSelectedItem() {
    var id = el.curItem.attr('id').split('-')[1];
    // If they click on "New Draft..."
    if (id == 0) {
      setEditing(true);
    } else {
      setEditing(id);
      el.title.val(el.curItem.find('a').html());
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
  }

  function setDraft(on) {
    fn.log('Setting draft to ', on, el.draft);
    if (on) {
      el.publish.html('Publish').addClass('icon-upload-alt').removeClass('icon-ok-circle');
      el.draft.val(1).attr('checked','checked');
    } else {
      el.publish.html('Published').removeClass('icon-upload-alt').addClass('icon-ok-circle');
      el.draft.val(0).attr('checked','');
    }
  }

  // Highlight the proper column
  function selectCol(col) {
    colIndex = col;
    if (colIndex == 0) {
      el.published.removeClass('active');
      el.curCol = el.drafts.addClass('active');
    } else {
      el.drafts.removeClass('active');
      el.curCol = el.published.addClass('active');
    }
    el.curColUl = el.curCol.find('ul');
  }

  function hidePreview() {
    el.admin.removeClass('preview');
    $('#preview-button').removeClass('icon-eye-close').addClass('icon-eye-open');
    state.preview = false;
  }

  function showPreview() {
    updatePreview();
    el.admin.addClass('preview');
    $('#preview-button').removeClass('icon-eye-open').addClass('icon-eye-close');
    state.preview = true;
  }

  // Hide editor buttons
  function hideBar() {
    el.bar.addClass('hidden');
  }

  function heartbeatLogger() {
    fn.log('State:',state,'Elements',el);
  }
});