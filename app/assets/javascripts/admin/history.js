(function(window,undefined){

  var History = window.History;

  if ( !History.enabled ) {
    return false;
  }

  History.Adapter.bind(window,'statechange',function windowStateChange(){
    var State = History.getState();
    fn.log(State.data, State.title, State.url);
  });

})(window, fn);