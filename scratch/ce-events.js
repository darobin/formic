
// NOTES
//  maybe we can use selection.modify() to know if we are at a boundary or not
//  depending on where the cursor ends up afterwards, we can guess that we are at a
//  boundary (especially if by luck it does not move)
//
//  if we can cancel the default behaviour for up and down, maybe we can handle it ourselves?

(function () {
    var top = NaN, savedRange;
    function details (ev) {
        var kc = ev.keyCode
        ,   ret = {
                sel:    window.getSelection()
            ,   range:  window.getSelection().getRangeAt(0)
            ,   up:     kc === 38
            ,   down:   kc === 40
            ,   left:   kc === 37
            ,   right:  kc === 39
            }
        ;
        ret.arrow = ret.up || ret.down || ret.left || ret.right;
        ret.upDown = ret.up || ret.down;
        return ret;
    }
    function rangeDown (ev) {
        var d = details(ev);
        if (d.upDown) {
            top = d.range.getBoundingClientRect().top;
            savedRange = d.range.cloneRange();
            d.sel.modify("move", d.up ? "backward" : "forward", "line");
        }
    }
    function rangePress (ev) {
        var d = details(ev)
        ,   atBoundary = (top - d.range.getBoundingClientRect().top) === 0
        ;
        if (d.upDown && atBoundary) {
            console.log("at boundary", d.up ? "top" : "bottom");
            // XXX
            //  fire an event indicating direction
            //  the default behaviour is to go to start/end of line (well, do the modify again)
            //  but it can be cancelled
            //  turn this into a proper implementation of the idea from the Substance guys
            //  see if this works on other browsers too
            //  apply to all data-cursorable
            d.sel.removeAllRanges();
            d.sel.addRange(savedRange);
        }
        if (d.upDown || !d.arrow) ev.preventDefault();
    }
    
    var x2 = document.getElementById("x2");
    x2.addEventListener("keydown", rangeDown, false);
    x2.addEventListener("keypress", rangePress, false);


    // x2.addEventListener("keypress", showRange, false);
    // x2.addEventListener("keydown", showRange, false);
    //
    // x2.addEventListener("keyup", position, false);
    // x2.addEventListener("keypress", position, false);

}());
