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

function routing(page) {
  fn.log('routing', page)
  Route.setPage(page);

  if (Route.is('/admin'))
    setEditing(false);
  else if (Route.is(/edit|new/))
    setEditing(true);
}