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