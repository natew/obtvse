$(function() {
  newPage();
});


function newPage() {
  // Filtering and other functions with the title field
  el.title
    .keyup(function titleKeyup(e) {
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
    })
    .keydown(function titleKeydown(e) {
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
}

// Highlight an item in the column
function selectItem(object, items) {
  fn.log(object);
  el.curItem.removeClass('selected');
  el.curItem = object.addClass('selected');
  return el.curItem.index();
}

// Either uses cache or loads post
function editSelectedItem(callback) {
  el.curItem.children('a')[0].click();
}