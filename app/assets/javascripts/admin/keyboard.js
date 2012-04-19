var key = {
  shift: false,
  cmd: false
};

// Window click
$(window).keydown(function windowKeydown(e) {
  fn.log(e.which);

  // Not editing
  if (!state.editing) { //!$.inArray(state.lastKey,disableKeys)
    switch (e.which) {
      // Cmd
      case 91:
        key.cmd = true;
        break;
      // Shift
      case 16:
        key.shift = true;
        break;
      // Enter
      case 13:
        e.preventDefault();
        if (el.curItem.length > 0) {
          editSelectedItem();
        }
        break;
      // Down, Tab
      case 40: case 9:
        if (!key.shift) {
          e.preventDefault();
          var next = el.curCol.find('li:not(.hidden)').eq(state.itemIndex[state.colIndex]+1);
          if (next.length > 0) {
            state.itemIndex[state.colIndex]++;
            fn.log(state.itemIndex,'col',state.colIndex,'next',next)
            selectItem(next);

            // Scroll column if necessary
            var itemOffset = el.curItem.position().top;
            if (itemOffset > (col_height/2)) {
              el.curColUl.scrollTop(el.curColUl.scrollTop()+el.curItem.height()*2);
            }
          }
          break;
        }
      // Up, Tab
      case 38: case 9:
        e.preventDefault();
        if (e.which == 9 && !key.shift) break;
        if (state.itemIndex[state.colIndex] > 0) {
          var prev = el.curCol.find('li:not(.hidden)').eq(state.itemIndex[state.colIndex]-1);
          if (prev.length > 0) {
            state.itemIndex[state.colIndex]--;
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
        e.preventDefault();
        if ($('#published li:not(.hidden)').length) changeCol();
        break;
      // Left
      case 37:
        e.preventDefault();
        if ($('#drafts li:not(.hidden)').length) changeCol();
        break;
      // P
      case 80:
        if (key.cmd) {
          e.preventDefault();
          editSelectedItem(function() {
            togglePreview();
          });
        }
        break;
    }
  }

  // Editing
  else {
    delayedHideBar();
    switch (e.which) {
      // Cmd
      case 91:
        key.cmd = true;
        break;
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
        if (key.cmd) {
          e.preventDefault();
          savePost();
        }
        break;
      // P
      case 80:
        if (key.cmd) {
          e.preventDefault();
          togglePreview();
        }
        break;
      // B
      case 66:
        if (key.cmd) {
          e.preventDefault();
          toggleBar();
        }
    }
  }

  // Record last key
  state.lastKey = e.which;
})

.keyup(function windowKeyup(e) {
  switch(e.which) {
    // Cmd
    case 91:
      key.cmd = false;
      break;
    case 16:
      key.shift = false;
  }
});



// Highlight the proper column
function changeCol() {
  el.curItem.removeClass('selected');

  // to Drafts
  if (el.curCol.is('#published')) {
    state.colIndex = 0;
    el.published.removeClass('active');
    el.curCol = el.drafts.addClass('active');
  }
  // to Published
  else {
    state.colIndex = 1;
    el.drafts.removeClass('active');
    el.curCol = el.published.addClass('active');
  }

  selectItem(el.curCol.find('li:not(.hidden):eq('+state.itemIndex[state.colIndex]+')'));
  el.curColUl = el.curCol.find('ul');
}

function filterTitle(objects, val) {
  return objects.filter(function filterTitleObjects(el) {
    var regex = new RegExp(val.split('').join('.*'), 'i');
    if (el.title.match(regex)) return true;
  }).map(function filterTitleMap(el) {
    return el.id;
  });
}