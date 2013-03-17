// State
var key = {
  shift: false,
  cmd: false
};

// Bindings
$(window)
  .keydown(function windowKeydown(e) {
    fn.log(e.which);

    // Not editing
    if (!state.editing) { //!$.inArray(state.lastKey,disableKeys)
      el.title.focus();
      switch (e.which) {
        // Enter
        case 13:
          e.preventDefault();
          if (el.curItem.length > 0) {
            editSelectedItem();
          }
          break;
        // Down, Tab
        case 40: case 9:
          if (!e.shiftKey) {
            e.preventDefault();
            var next = el.curCol.find('li:not(.hidden)').eq(state.itemIndex[state.colIndex]+1);
            if (next.length > 0) {
              state.itemIndex[state.colIndex]++;
              fn.log(state.itemIndex,'col',state.colIndex,'next',next);
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
          if (e.which == 9 && !e.shiftKey) break;
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
          if (e.metaKey) {
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
      switch (e.which) {
        // Enter
        case 13:
          if (el.title.is(':focus'))
            e.preventDefault();
          break;
        // Cmd
        case 91:
          key.cmd = true;
          break;
        // Esc
        case 27:
          e.preventDefault();
          if (!state.barPinned && !el.bar.is('.shy')) showBar(false);
          else if (state.preview) hidePreview();
          else $('#back-button')[0].click();
          break;
        // Backspace
        case 8:
          if (!state.beganEditing && el.title.val().length <= 1)
            $('#back-button')[0].click();
          break;
        // S
        case 83:
          if (e.metaKey) {
            e.preventDefault();
            savePost();
          }
          break;
        // P
        case 80:
          if (e.metaKey) {
            e.preventDefault();
            togglePreview();
          }
          break;
        // B
        case 66:
          if (e.metaKey) {
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
  })

  .blur(function() {
    key.cmd = false;
    key.shift = false;
  });