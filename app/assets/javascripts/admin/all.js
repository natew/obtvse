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

var el, lineHeight;

$(function() {

  // Setup routes
  Routes.bind({
    'admin':    'index',
    'edit|new': 'edit'
  });

  // Attach turbolinks events to routing
  Routes.enter();

  $(document)
    .on('page:fetch', function() {
      Routes.leave()
    })
    .on('page:load', function() {
      Routes.enter();
    });

  // Clear cache
  localStorage.clear();

  // Permanent bindings
  $(window)
    .mousemove(function windowMouseMove(evt){
      // Accurate detection for bar hover
      if (state.editing) {
        if (evt.pageX < 90)
          showBar(true);
        else if (evt.pageX > 95 && !$('#bar:hover').length)
          delayedHideBar();
      }
    })

    .on('beforeunload', function() {
      if (state.editing)
        savePost();
    })

    .click(function windowClick(e){
      if (!state.editing)
        el.title.focus();
    });

  // Determine line height from css
  lineHeight = $('#line-height').height();

  // Avoid initial animations
  $('body').addClass('transition');

});

function makeExpandingAreas() {
  makeExpandingArea(document.getElementById('text-title'));
  makeExpandingArea(document.getElementById('text-content'));
}


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
