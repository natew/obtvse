// Window click
$(window).keydown(function windowKeydown(e) {
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

  // Editing shortcuts
  else {
    delayedHideBar();
    switch (e.which) {
      // Cmd
      case 91:
        commandPressed = true;
        break;
      // Esc
      case 27:
        e.preventDefault();
        if (state.preview) hidePreview();
        else {
          setEditing(false);
        }
        break;
      // Backspace
      case 8:
        if (el.title.val() == '') setEditing(false);
        break;
      // S
      case 83:
        // If lastkey is Command
        if (commandPressed) {
          e.preventDefault();
          savePost();
        }
        break;
      // P
      case 80:
        if (commandPressed) {
          e.preventDefault();
          togglePreview();
        }
        break;
    }

    state.lastKey = e.which;
  }
})

.keyup(function windowKeyup(e) {
  switch(e.which) {
    // Cmd
    case 91:
      commandPressed = false;
      break;
  }
});