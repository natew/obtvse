var Routes = (function() {
  var routes, current;

  return {
    bind: function(routes) {
      this.routes = routes;
    },

    enter: function(page) {
      if (page === undefined)
        page = window.location.pathname;

      for (var route in this.routes) {
        if (new RegExp(route).test(page)) {
          current = this.routes[route];
          var to = current + ':enter';
          fn.log(to);
          $('body').addClass(current);
          $.publish(to);
          break;
        }
      }
    },

    leave: function() {
      var from = current + ':leave';
      fn.log(from);
      $('body').removeClass(current);
      $.publish(from);
      current = '';
    }
  };
})();
