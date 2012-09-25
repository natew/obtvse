// The grid manages tiles using ids, which you can define. For our
// examples we'll just use the tile number as the unique id.
var TILE_IDS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
];


// templates in JSON matching the predefined selections you can
// choose on the demo page
var DemoTemplateRows = [
    [
        " A A B B C C ",
        " A A B B C C ",
        " . . . . . . ",
        " D D E E F F "
    ], [
        " A A A A A A ",
        " B B C C D D ",
        " B B C C D D ",
        " B B C C D D "
    ], [
        " A A B B . ",
        " A A B B . ",
        " A A C C . ",
        " . . . . . ",
        " D D E E E ",
        " D D F F . ",
        " . . F F . "
    ], [
        " A A . . ",
        " A A . . ",
        " B B . . ",
        " C C . ."
    ], [
        " A A A B B B ",
        " A A A B B B ",
        " A A A C C . ",
        " . . . . . ."
    ]
];

// SAMPLE #2
$(function() {

    var el = document.getElementById('sample2-grid'),
        grid = new Tiles.Grid(el);

    // template is selected by user, not generated so just
    // return the number of columns in the current template
    grid.resizeColumns = function() {
        return this.template.numCols;
    };

    // by default, each tile is an empty div, we'll override creation
    // to add a tile number to each div
    grid.createTile = function(tileId) {
        var tile = new Tiles.Tile(tileId);
        tile.$el.append('<div class="dev-tile-number"><a href=""><img src="/qliq/imgs/pic-' + tileId + '.jpg" /></a></div>');
        return tile;
    };

    // update the template selection
    var $templateButtons = $('#sample2-templates .dev-template').on('click', function(e) {

        // unselect all templates
        $templateButtons.removeClass("selected");

        // select the template we clicked on
        $(e.target).addClass("selected");

        // get the JSON rows for the selection
        var index = $(e.target).index(),
            rows = DemoTemplateRows[index];

        // set the new template and resize the grid
        grid.template = Tiles.Template.fromJSON(rows);
        grid.isDirty = true;
        grid.resize();

        // adjust number of tiles to match selected template
        var ids = TILE_IDS.slice(0, grid.template.rects.length);
        grid.updateTiles(ids);
        grid.redraw(true);
    });

    // make the initial selection
    $('.dev-l3').trigger('click');

    // wait until users finishes resizing the browser
    var debouncedResize = debounce(function() {
        grid.resize();
        grid.redraw(true);
    }, 200);

    // when the window resizes, redraw the grid
    $(window).resize(debouncedResize);
});