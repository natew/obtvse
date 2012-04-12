DEBUG = true;

String.prototype.leftPad = function (l, c) { return new Array(l - this.length + 1).join(c || ' ') + this; }

var fn = {
  log: function() {
    if (DEBUG) console.log(arguments.callee.caller.name.toString().leftPad(20) + ' | ', arguments);
  },

  getjQueryElements: function(object) {
    for (var key in object) {
      object[key] = $(object[key]);
    }
    return object;
  }
};