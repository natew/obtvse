curPath = window.location.pathname.split('/');

$(function() {
  //
  // DEBUG
  //
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

  // Window.mousemove
  $(window).mousemove(function windowMouseMove(evt){
    // Accurate detection for bar hover
    if (state.editing) {
      if (evt.pageX < 90) showBar(true);
      else if (evt.pageX > 95 && !$('#bar:hover').length) delayedHideBar(500);
    }
  })

  // Window.blur
  .blur(function() {
    key.cmd = false;
    key.shift = false;
  })

  // Window.beforeunload
  .on('beforeunload', function() {
    if (state.editing) savePost();
  });

  // Autosave
  setInterval(function autoSave(){
    if (state.editing && state.changed && !state.saving) {
      savePost();
    }
  }, saveInterval);

  // Avoid initial animations
  el.section.addClass('transition');
  el.bar.addClass('transition');

  //
  // BINDINGS
  //

  // Filtering and other functions with the title field
  el.title.keyup(function titleKeyup(e) {
    if (!state.editing) {
      // Filtering
      var val = $(this).val();
      if (val && val != prevVal) {
        prevVal = val;
        var draft_ids = filterTitle(draftsItems,val).join(',#post-'),
            pub_ids   = filterTitle(publishedItems,val).join(',#post-');

        draft_ids ? showOnly('#drafts li', '#post-0,#post-'+draft_ids) : $('#drafts li:not(#post-0)').addClass('hidden');
        pub_ids   ? showOnly('#published li', '#post-'+pub_ids) : $('#published li').addClass('hidden');
        if (!draft_ids && !pub_ids) setEditing(true);
        state.itemIndex[0] = 0;
        state.itemIndex[1] = 0;
        selectItem($('.col li:not(.hidden):first'));
      }
      else if (!val) {
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

  // Window.click
  $(window).click(function windowClick(e){
    if (!state.editing) el.title.focus();
    else {
      if (e.pageX > 95 && !state.barHidden) delayedHideBar();
    }
  });

  // ContentFielset.scroll
  $('#post-editor').on('scroll', function() {
    updatePreviewPosition();
    savePosition();
  });

  // ColA.click
  $('.col a').on('click', function colAClick(e) {
    e.preventDefault();
    selectItem($(this).parent());
    editSelectedItem();
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
  $('#post_content,#post_title,#post_slug,#post_url').on('change input', function(){
    // beganEditing prevents from saving just anything thats type in the title box
    // Until focus is set on the content, it will be false
    if (state.beganEditing) {
      state.changed = true;
      el.save.addClass('dirty');
    }
  });

  // Back.click
  $('#back-button').click(function backButtonClick(e) {
    e.preventDefault();
    fn.log('Press back button');
    if (state.editing) setEditing(false);
  });

  // Preview.click
  $('#preview-button').click(function previewButtonClick(e){
    e.preventDefault();
    if (state.preview) hidePreview();
    else {
      showPreview();
      updatePreviewPosition();
    }
  });

  // Publish.click
  el.publish.click(function publishClick(e) {
    e.preventDefault();
    el.publish.html('...')
    setDraftInput(!state.post.draft);
    savePost();
  })

  // Publish.hover
  .hover(function() {
    if (state.post.draft) el.publish.html('Publish?');
    else el.publish.html('Unpublish?');
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
  $('#menu-info').mouseenter(function() {
    $('#wordcount').html(el.content.val().split(/\s+/).length +' words');
  });
});