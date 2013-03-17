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

var el,
    $html = $('html');

$(function() {

  // Setup routes
  Routes.bind({
    'admin':    'index',
    'edit|new': 'edit'
  });

  Routes.enter();

  $(document)
    .on('page:fetch', function() {
      Routes.leave();
    })
    .on('page:load', function() {
      Routes.enter();
    })
    .on('page:restore', function() {
      Routes.leave();
      Routes.enter();
    });

  // Clear cache
  localStorage.clear();

  // Permanent bindings
  $(window)
    .mousemove(function windowMouseMove(e){
      setBarVisibility(e);
      addMovingClassToBodyIfMouseMoving();
    });

  // Avoid initial animations
  $('html').addClass('transition');

  // External links
  $('.open-external').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'));
  });
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

var movingTimeout, moving = false;
function addMovingClassToBodyIfMouseMoving() {
  if (!moving) {
    moving = true;
    $('body').addClass('moving');
  }

  clearTimeout(movingTimeout);
  movingTimeout = setTimeout(function() {
    moving = false;
    $('body').removeClass('moving');
  }, 1000);
}

var setBarVisibility = _.debounce(function(e) {
  // Accurate detection for bar hover
  if (state.editing) {
    if (e.pageX < 90)
      showBar(true);
    else if (e.pageX > 95 && !$('#bar:hover').length)
      delayedHideBar();
  }
}, 15);