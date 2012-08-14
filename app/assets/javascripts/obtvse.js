if (typeof Obtvse === 'undefined') {
  var displayGist = function(selector, gistResponse) {
    $(selector).html(gistResponse.div);
  };

  var getGist = function(id, success) {
    $.ajax({
          url: 'https://gist.github.com/' + id + '.json',
          dataType: 'jsonp',
          success: function(gist) {
            success("#" + id, gist);
          }
      });
  };

  Obtvse = {
    /**
     * Find all divs that should have gists fetched and rendered.
     *
     * The "id" attribute of the elements that match the given
     * selector should be equal to the gist id.
     */
    renderGists: function(selector) {
      $(selector).each(function() {
        getGist(this.id, displayGist)
      });
    }
  };
}