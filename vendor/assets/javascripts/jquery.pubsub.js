/*
 * Simple Pub/Sub Implementation for jQuery
 *
 * Inspired by work from Peter Higgins (https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js)
 *
 * This is about the simplest way to write a pubsub JavaScript implementation for use with jQuery.
 */

 /*
 For example:

 var handle = $.subscribe('notification', function (msg) {
   alert(msg);
 });

 $.publish('notification', ['Hello World']);

 $.unsubscribe(handle);

 */

(function( $ ) {
  // Cache of all topics
  var topics = {};

  // Iterates through all subscribers of a topic and invokes their callback,
  // passing optional arguments.
  $.publish = function( topic, args ) {
    if ( topics[ topic ] ) {
      var thisTopic = topics[ topic ],
        thisArgs = args || [];

      for ( var i = 0, j = thisTopic.length; i < j; i++ ) {
        thisTopic[i].apply( $, thisArgs );
      }
    }
  };

  // Returns a handle needed for unsubscribing
  $.subscribe = function( topic, callback ) {
    if ( !topics[ topic ] ) {
      topics[ topic ] = [];
    }

    topics[ topic ].push( callback );

    return {
      topic: topic,
      callback: callback
    };
  };

  // Removes the subscriber from the particular topic its handle was assigned to
  $.unsubscribe = function( handle ) {
    var topic = handle.topic;

    if ( topics[ topic ] ) {
      var thisTopic = topics[ topic ];

      for ( var i = 0, j = thisTopic.length; i < j; i++ ) {
        if ( thisTopic[i] === handle.callback ) {
          thisTopic.splice( i, 1 );
          // break; here? duplicate handles are possible
        }
      }
    }
  };

})( jQuery );
