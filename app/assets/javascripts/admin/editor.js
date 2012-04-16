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

  // Avoid initial animations
  el.section.addClass('transition');
  el.bar.addClass('transition');

  // Accurate detection for bar hover
  $(window).mousemove(function windowMouseMove(evt){
    if (state.editing) {
      if (evt.pageX < 90) showBar(true);
      else if (evt.pageX > 95) delayedHideBar(500);
    }
  });

  // Detect if we are editing initially
  if (curPath.length > 2) {
    setEditing(parseInt(curPath[2],10), function editLoaded(){
      if (window.location.hash == '#preview') showPreview();
      state.beganEditing = true;
    });
  } else  {
    el.title.focus();
    if (curPath[1] == 'new') {
      setEditing(true);
    }
  }

  if ($.cookie('barPinned') == 'true') toggleBar();

  // Select first item
  selectItem($('.col li:visible:first'));

  // Autosave
  setInterval(function autoSave(){
    if (state.editing && state.changed && !state.saving) {
      savePost();
    }
  }, saveInterval);

  //
  // BINDINGS
  //

  // Filtering and other functions with the title field
  el.title.keyup(function titleKeyup(e) {
    if (!state.editing) {
      // Selecting
      if (el.curItem.length == 0 || el.curItem.is('.hidden')) {
        selectItem($('.col li:visible:first'));
      }

      // Filtering
      var val = $(this).val();
      if (val) {
        var draft_ids = filterTitle(draftsItems,val).join(',#post-'),
            pub_ids   = filterTitle(publishedItems,val).join(',#post-');

        draft_ids ? showOnly('#drafts li', '#post-0,#post-'+draft_ids) : $('#drafts li').addClass('hidden');
        pub_ids   ? showOnly('#published li', '#post-'+pub_ids) : $('#published li').addClass('hidden');
        if (!draft_ids && !pub_ids) setEditing(true);
        state.itemIndex[0] = 0;
        state.itemIndex[1] = 0;
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
    selectItem($('.col li:visible:first'));
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
    savePost(function() {
      updateDraftButton(state.post.draft);
    });
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
});