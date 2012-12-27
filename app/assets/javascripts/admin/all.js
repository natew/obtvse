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
    el,
    editorSelectors = {
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
    };

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

  // DEBUG
  setInterval(heartbeatLogger, 10000);

  //
  // SETUP
  //

  // Do routing actions
  routing(window.location.pathname);

  $(document).on('page:fetch', function() {
    routing(window.location.pathname);
  });

  // Clear cache
  localStorage.clear();

  // Auto expanding textareas.
  makeExpandingAreas();

  // Set minimum height of content textarea and post lists
  setHeights();
  $(window).resize(setHeights);

  if (window.location.hash == '#preview') showPreview();


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



// Enter editor, val can be true, false, or the ID
//   true = editing a new post
//   false = exit editor
//   id = start editing id
function setEditing(val, callback) {
  fn.log('set editing', val);
  el = fn.getjQueryElements(editorSelectors);

  if (val !== false) {
    // Update UI
    delayedHideBar();
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

    // Select col
    selectItem($('.col li:not(.hidden):first'));

    // Update UI
    el.admin.removeClass('preview editing');
    showBar(false);

    // Update selection
    selectItem($('#drafts li:first'));
  }
}
