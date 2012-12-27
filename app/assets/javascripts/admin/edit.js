curPath = window.location.pathname.split('/');

// Keys
var key = {
  shift: false,
  cmd: false
};

// Editor state variables
var state = {
  post         : null,
  preview      : false,
  changed      : false,
  editing      : false,
  beganEditing : false,
  barHidden    : false,
  barPinned    : false,
  saving       : false,
  lastKey      : 0,
  lines        : 0,
  colIndex     : 0,
  itemIndex    : [0, 0]
};

var text_title,
    text_content,
    saveInterval,
    draftsItems,
    publishedItems,
    col_height,
    showdown,
    lineHeight,
    previewHeight,
    hideBarTimeout,
    scrollTimeout,
    prevVal,
    el;

$(function() {
  // VARIABLES
  text_title     = document.getElementById('text-title'),
  text_content   = document.getElementById('text-content'),
  saveInterval   = 3000,
  draftsItems    = $('#drafts ul').data('items'),
  publishedItems = $('#published ul').data('items'),
  col_height     = 0,
  showdown       = new Showdown.converter(),
  lineHeight     = $('#line-height').height(),
  previewHeight  = 0,
  hideBarTimeout = null,
  scrollTimeout  = null,
  prevVal        = null;

  // Elements
  el = fn.getjQueryElements({
    section   : '.split-section',
    published : '#published',
    drafts    : '#drafts',
    admin     : '#admin',
    editor    : '#post-editor',
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
    curItem   : '.col li:first',
    blog      : '#blog-button',
    publish   : '#publish-button',
    preview   : '#post-preview'
  });

  // DEBUG
  setInterval(heartbeatLogger, 10000);

  //
  // SETUP
  //

  // Clear cache
  localStorage.clear();

  // Auto expanding textareas.
  makeExpandingAreas();

  // Set minimum height of content textarea and post lists
  setHeights();
  $(window).resize(setHeights);

  // Detect if we are editing initially
  if (curPath.length > 2) {
    setEditing(parseInt(curPath[2],10), function editLoaded(){
      if (window.location.hash == '#preview') showPreview();
      state.beganEditing = true;
    });
  } else  {
    selectItem($('.col li:not(.hidden):first'));
    el.title.focus();
    if (curPath[1] == 'new') {
      setEditing(true);
    }
  }

  if ($.cookie('barPinned') == 'true') toggleBar();

  $(window)
    .mousemove(function windowMouseMove(evt){
      // Accurate detection for bar hover
      if (state.editing) {
        if (evt.pageX < 90) showBar(true);
        else if (evt.pageX > 95 && !$('#bar:hover').length) delayedHideBar();
      }
    })

    .blur(function() {
      key.cmd = false;
      key.shift = false;
    })

    .on('beforeunload', function() {
      if (state.editing) savePost();
    })

    .click(function windowClick(e){
      if (!state.editing) el.title.focus();
    });

  // Autosave
  setInterval(function autoSave(){
    if (state.editing && state.changed && !state.saving) {
      savePost();
    }
  }, saveInterval);

  // Avoid initial animations
  $('body').addClass('transition');

  //
  // BINDINGS
  //

  // ContentFielset.scroll
  $('#post-editor').on('scroll', function() {
    updatePreviewPosition();
    savePosition();
  });

  // Content.focus - detect beginning of editing
  el.content.focus(function contentFocus() {
    state.beganEditing = true;
  });

  // Post.input - preview updating
  $('#post_content,#post_title').on('input',function postInput() {
    if (state.preview) updatePreview();
  });

  // DOMSubtreeModified detects when the text pre changes size,
  // so we can adjust the height of the other text areas
  $('#text-title pre').on('DOMSubtreeModified', function textTitleModified() {
    fn.log(setHeights());
  });

  // Post.change - autosave detection
  $('#post_content, #post_title, #post_slug, #post_url').on('change input', function(){
    // beganEditing prevents from saving just anything thats type in the title box
    // Until focus is set on the content, it will be false
    if (state.beganEditing) {
      state.changed = true;
      el.save.addClass('dirty');
    }
  });

  // Back.click
  $('#back-button').click(function backButtonClick() {
    if (state.editing) setEditing(false);
  });

  // Preview button
  $('#preview-button').click(function previewButtonClick(e){
    e.preventDefault();
    if (state.preview) hidePreview();
    else {
      showPreview();
      updatePreviewPosition();
    }
  });

  // Publish button
  el.publish
    .click(function publishClick(e) {
      e.preventDefault();
      el.publish.html('...')
      setDraftInput(!state.post.draft);
      savePost();
    })

    .hover(function() {
      if (state.post.draft) el.publish.html('Publish?');
      else el.publish.html('Undo?');
    }, function() {
      if (state.post.draft) el.publish.html('Draft');
      else el.publish.html('Published');
    });

  // Save.click
  $('#save-button').click(function saveButtonClick(e){
    e.preventDefault();
    savePost();
  });

  // Bar.click
  el.bar.click(function barClick(e) {
    if (state.preview && e.target.id == 'bar') hidePreview();
  });

  // Wordcount
  $('#stats-button').mouseenter(function() {
    $('#wordcount').html(el.content.val().split(/\s+/).length +' words');
  });
});

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

function showOnly(context,selectors) {
  $(context).addClass('hidden').filter(selectors).removeClass('hidden');
}

// Set post content height and column height
function setHeights() {
  var content_height = Math.max($(window).height() - el.title.height()-40,100);
  col_height = $(window).height()-125;
  $('.col ul').css('height', col_height);
  el.content.css('min-height', content_height);
  $('#content-fieldset').css('height', content_height);
  return col_height;
}

// Saves the post
function savePost(callback) {
  state.saving = true;
  state.changed = false;
  el.save.addClass('saving');
  fn.log('Saving',el.draft);

  // POST
  $.ajax({
    type: 'POST',
    url: el.form.attr('action'),
    data: el.form.serialize(),
    dataType: 'text',
    success: function savingSuccess(data) {
      var data = JSON.parse(data),
          li   = $('#post-'+data.id),
          list = (data.draft == 'true') ? $('#drafts ul') : $('#published ul');

      // Update state
      state.saving = false;

      // Update publish button
      el.save.removeClass('saving dirty').addClass('saved');
      setTimeout(function(){el.save.removeClass('saved')},500);

      // If we just finished creating a new post
      if (!state.post) {
        setFormAction('/edit/'+data.id);
        setFormMethod('put');
      }

      // Update cache and post data
      setCache(data.id, data);
      state.post = data;

      // Update form
      updateMetaInfo();

      // If item exists move to top, else add to top
      if (li.length) li.prependTo(list);
      else {
        $('#drafts ul').prepend('<li id="post-'+state.post.id+'"><a href="">'+el.title.val()+'</a></li>');
      }

      fn.log('Saved',data.id,data);
      if (callback) callback.call(this, data);
    },
    error: function (xmlHttpRequest, textStatus, errorThrown) {
      if (xmlHttpRequest.readyState == 0 || xmlHttpRequest.status == 0)
        return;  // it's not really an error
      else
        alert('Could not save.  Please backup your post!');
    }
  });
}

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
  var cache = getCache(id);
  if (cache) {
    callback.call(this, cache);
  } else {
    $.getJSON('/get/'+id, function loadCacheCallback(data) {
      setCache(id, data);
      callback.call(this, data);
    });
  }
}

// Enter editor, val can be true, false, or the ID
//   true = editing a new post
//   false = exit editor
//   id = start editing id
function setEditing(val, callback) {

  if (val !== false) {
    // Update UI
    el.admin.addClass('editing');
    el.bar.removeClass('hidden');
    state.editing = true;
    showBar(true);

    // If true, start editing a new post
    if (val === true) {
      setFormAction('/posts');
      setFormMethod('post');
    }
    // Editing post id = val
    else {
      loadCache(val, function setEditingLoadCache(data) {
        fn.log('got data', data);
        // Set state variables
        state.post = data;

        // Set form attributes
        el.content.val(state.post.content);
        updateMetaInfo();

        // Refresh form
        makeExpandingAreas();
        // scrollToPosition();

        // Update link to post
        el.blog.attr('href',window.location.protocol+'//'+window.location.host+'/'+state.post.slug).attr('target','_blank');

        // Callbacks
        if (callback) callback.call(this, data);
      });
    }
  }
  else {
    // Save before closing
    if (state.changed) savePost();

    // Update state
    state.editing = false;
    state.beganEditing = false;

    // Clear form
    el.title.val('').focus();
    el.content.val('');
    makeExpandingAreas();
    setFormMethod('post');

    // Update UI
    el.blog.attr('href','/').removeAttr('target');
    el.admin.removeClass('preview editing');
    showBar(false);

    // Update selection
    selectItem($('#drafts li:first'));
  }
}

function updateMetaInfo() {
  el.slug.val(state.post.slug);
  el.url.val(state.post.url);
  setDraft(state.post.draft);
}

// Set form action
function setFormAction(url) {
  el.form.attr('action',url);
}

// Set form method
function setFormMethod(type) {
  var put = $('form div:first input[value="put"]');
  if (type == 'put' && !put.length) $('form div:first').append('<input name="_method" type="hidden" value="put">');
  else if (type != 'put') put.remove();
}

function setDraft(draft) {
  setDraftInput(draft);
  updateDraftButton(draft);
}

function setDraftInput(draft) {
  fn.log(draft);
  el.draft.attr('value',(draft ? 1 : 0));
  el.draft.attr('checked',(draft ? 'checked' : ''));
}

function updateDraftButton(draft) {
  fn.log(draft);
  if (draft) el.publish.html('Draft').addClass('icon-edit').removeClass('icon-check');
  else       el.publish.html('Published').removeClass('icon-edit').addClass('icon-check');
}

// Preview
function updatePreviewPosition() {
  if (state.preview) {
    var textareaOffset = el.content.offset().top,
        lineOffset     = parseInt((-textareaOffset)/lineHeight,10),
        percentDown    = lineOffset / state.lines,
        previewOffset  = previewHeight * percentDown;

    el.preview.scrollTop(previewOffset);
  }
}

// Markdown preview
function updatePreview() {
  var title = el.title.val().split("\n").join('<br />');
  $('#post-preview .inner').html('<h1>'+(title ? title : 'No Title')+'</h1>'+showdown.makeHtml(el.content.val()));
  state.lines   = el.content.height()/lineHeight;
  previewHeight = $('#post-preview .inner').height();
}

function togglePreview() {
  if (state.preview) hidePreview();
  else showPreview();
}

function hidePreview() {
  pushState('/edit');
  pushState('/edit/'+state.post.id);
  el.admin.removeClass('preview');
  $('#preview-button').removeClass('icon-eye-close').addClass('icon-eye-open');
  state.preview = false;
}

function showPreview() {
  updatePreview();
  window.location.hash = 'preview';
  el.admin.addClass('preview');
  makeExpandingAreas();
  $('#preview-button').removeClass('icon-eye-open').addClass('icon-eye-close');
  state.preview = true;
}

function toggleBar() {
  state.barPinned = !state.barPinned;
  $.cookie('barPinned',state.barPinned);
  if (state.barPinned) showBar(true);
  else showBar(false);
}

function showBar(yes) {
  state.barHidden = !yes;
  if (yes) {
    clearTimeout(hideBarTimeout);
    el.bar.removeClass('hidden');
  }
  else if (!state.barPinned && !el.bar.is(':hover')) {
    el.bar.addClass('hidden');
  }
}

function delayedHideBar(time) {
  clearTimeout(hideBarTimeout);
  hideBarTimeout = setTimeout(function(){showBar(false)},(time ? time : 1000));
}

function savePosition() {
  clearTimeout(scrollTimeout);
  if (state.editing) {
    scrollTimeout = setTimeout(function() {
      $.cookie('position-'+state.post.id,el.editor.scrollTop());
    },1000);
  }
}

// Scroll to bottom of content and select the end
function scrollToPosition() {
  var cookie = $.cookie('position-'+state.post.id);
  fn.log('Scroll to position',cookie);
  if (cookie) el.editor.scrollTop(cookie);
  else {
    // Scroll to bottom
    el.content.focus().putCursorAtEnd();
    $('#post-editor').scrollTop(el.content.height());
  }
}

function heartbeatLogger() {
  fn.log('State:',state,'Elements',el);
}