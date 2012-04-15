// modal('Exit without saving?',
//   {
//     'Save and exit': {
//       type: 'primary',
//       callback: function() {
//         savePost();
//         setEditing(false);
//       }
//     },
//     'Exit without saving': {
//       callback: function() {
//         setEditing(false);
//       }
//     },
//     'Close': {
//       callback: function() {
//         $('#modal').modal('hide');
//       }
//     }
//   }
// );

var btnPri = $('#btn-primary').remove(),
    btnSec = $('#btn-secondary').remove();

function modal(title, buttons) {
  $('#modal-title').html(title);

  for (var key in buttons) {
    var options = buttons[key],
        button  = (options.type && options.type == 'primary') ? btnPri.clone() : btnSec.clone();

    button.html(key).appendTo('.modal-footer').click(function(e) {
      e.preventDefault();
      if (options.callback) options.callback.call();
    });
  }

  $('#modal').modal({keyboard:false});
}