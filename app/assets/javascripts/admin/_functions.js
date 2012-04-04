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

function savePost() {
  var form = $('.edit_post,#new_post'),
      action = form.attr('action');

  $.post(action, form.serialize(), function() {
    $('#save-button').val('Saved').addClass('saved').attr('disabled','disabled');
  });
}

function updatePreview() {
  $('#post-preview').html('<h1>'+$('#post_title').val()+'</h1>'+showdown.makeHtml($('#post_content').val()));
}