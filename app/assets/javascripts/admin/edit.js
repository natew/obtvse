var showdown       = new Showdown.converter(),
    saveInterval   = 5000,
    previewHeight  = 0,
    hideBarTimeout = null,
    scrollTimeout  = null,
    lineHeight = 24,
    editElements   = {
      admin     : '#admin',
      editor    : '#post-editor',
      title     : '#post_title',
      content   : '#post_content',
      slug      : '#post_slug',
      url       : '#post_url',
      published : '#post_published_at',
      draft     : '#post_draft',
      save      : '#save-button',
      form      : '#new_post, .edit_post',
      bar       : '#bar',
      blog      : '#blog-button',
      publish   : '#publish-button',
      preview   : '#post-preview'
    };

$.subscribe('edit:enter', function(id) {
  state.editing = true;

  el = fn.getjQueryElements(editElements);
  makeExpandingAreas();
  setPostState();
  updatePostState();
  setLineHeight();
  setEditorHeight();

  if (window.location.hash == '#preview')
    showPreview();

  setTimeout(function() {
    el.title.focus().putCursorAtEnd();
  }, 0);

  resetAutoSave();
  initBar();
  doEditBindings();
});

$.subscribe('edit:leave', function() {
  state.editing = false;
  savePost();
});

$(window)
  .on('beforeunload', function() {
    if (state.editing)
      savePost();
  })
  .resize(setEditorHeight);

function doEditBindings() {
  // ContentFielset.scroll
  $('#post-editor').on('scroll', function() {
    updatePreviewPosition();
    savePosition();
  });

  // Post.input - preview updating
  $('#post_content,#post_title').on('input',function postInput() {
    if (state.preview) updatePreview();
  });

  // DOMSubtreeModified detects when the text pre changes size,
  // so we can adjust the height of the other text areas
  $('#text-title pre').on('DOMSubtreeModified', function textTitleModified() {
    fn.log(setColumnHeights());
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
      el.publish.html('...');
      setDraft(!state.post.draft);
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

  // Menu hover
  $('.menu').hover(function() {
    var menu = this;
    setTimeout(function() {
      $('input:first', menu).focus().select();
    }, 0);
  });

  // Wordcount
  $('#stats-button').mouseenter(function() {
    $('#wordcount').html(el.content.val().split(/\s+/).length +' words');
  });
}

function initBar() {
  if ($.cookie('barPinned') == 'true')
    toggleBar();
  else {
    showBar(true);
    delayedHideBar();
  }
}

var autoSaveInterval;
function resetAutoSave() {
  // Interval
  clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(savePost, saveInterval);

  // Set to dirty on change/input
  $('input, textarea').on('change input', function(){
    state.changed = true;
    el.save.addClass('dirty');
  });
}

function setPostState() {
  state.editing = true;
  state.post = $('#post').data('state');
}

function updatePostState() {
  if (!state.post) return;
  el.slug.val(state.post.slug);
  el.url.val(state.post.url);
  el.published.val(state.post.published_at);
  el.blog.attr('href', '/' + state.post.slug);
}

// Saves the post
function savePost(callback) {
  if (state.saving || !state.changed)
    return false;

  state.saving = true;
  state.changed = false;
  el.save.addClass('saving');
  fn.log('Saving', state.changed);

  // POST
  $.ajax({
    type: 'POST',
    url: el.form.attr('action'),
    data: el.form.serialize(),
    dataType: 'text',
    success: function savingSuccess(data) {
      var data = JSON.parse(data);

      // Update state
      state.saving = false;

      // Update save button
      el.save.removeClass('saving dirty').addClass('saved');
      setTimeout(function() {
        if (el.save) el.save.removeClass('saved')
      }, 500);

      // If we just finished creating a new post
      if (!state.post) {
        setFormAction('/' + data.id);
        setFormMethod('put');
      }

      // Update cache and post data
      setCache(data.id, data);
      state.post = data;

      // Update form
      updatePostState();

      fn.log('Saved', data.id, data);
      if (callback) callback.call(this, data);
    },
    error: function (xmlHttpRequest, textStatus, errorThrown) {
      if (xmlHttpRequest.readyState == 0 || xmlHttpRequest.status == 0)
        return;  // it's not really an error
      else {
        alert('Could not save.  Please backup your post!');
        el.save.removeClass('dirty saving').addClass('error');
      }
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
  state.changed = true;
  el.draft.attr('value',(draft ? 1 : 0));
  el.draft.attr('checked',(draft ? 'checked' : ''));
}

function updateDraftButton(draft) {
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
  window.location.hash = '';
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

function showBar(show) {
  state.barHidden = !show;
  if (show) {
    clearTimeout(hideBarTimeout);
    el.bar.removeClass('shy');
  }
  else if (el.bar && !state.barPinned && !el.bar.is(':hover')) {
    el.bar.addClass('shy');
  }
}

function delayedHideBar(time) {
  clearTimeout(hideBarTimeout);
  hideBarTimeout = setTimeout(function(){
    showBar(false)
  }, (time ? time : 1000));
}

function savePosition() {
  clearTimeout(scrollTimeout);
  if (state.editing) {
    scrollTimeout = setTimeout(function() {
      $.cookie('position-'+state.post.id, el.editor.scrollTop());
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

function setLineHeight() {
  // Determine line height from css
  lineHeight = $('#line-height').height();
}

function setEditorHeight() {
  if (!state.editing) return false;
  var content_height = $(window).height() - el.title.height();
  // content_height + margin
  $('#text-content').css('min-height', content_height);
}