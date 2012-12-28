$.subscribe('new:enter', function() {
  el = fn.getjQueryElements(editElements);
  makeExpandingAreas();

  setFormAction('/posts');
  setFormMethod('post');
})

