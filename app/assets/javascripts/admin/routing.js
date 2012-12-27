var Route = function(string) {
  var page;
};

Route.prototype = {
  setPage: function(page) {
    this.page = page;
  },

  getPage: function() {
    return this.page;
  },

  is: function(comparedTo) {
    if (typeof comparedTo == 'object')
      return comparedTo.test(this.page);

    return comparedTo == this.page;
  }
};

Route = new Route();

$(document)
  .on('ready', function() {
    routing(window.location.pathname);
  })
  .on('page:fetch', function() {
    routing(window.location.pathname);
  });


function routing(page) {
  Route.setPage(page);

  if (Route.is('/admin'))
    setEditing(false);
  else if (Route.is(/(edit|new)\//))
    setEditing(true);
}