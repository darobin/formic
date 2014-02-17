
// NOTES
//  maybe we can use selection.modify() to know if we are at a boundary or not
//  depending on where the cursor ends up afterwards, we can guess that we are at a
//  boundary (especially if by luck it does not move)
//
//  if we can cancel the default behaviour for up and down, maybe we can handle it ourselves?

(function () {
    var top = NaN, savedRange;
    function rangeDown (ev) {
        var sel = window.getSelection()
        ,   range = sel.getRangeAt(0)
        ,   kc = ev.keyCode
        ,   up = kc === 38
        ,   dn = kc === 40
        ,   arrow = up || dn
        ;
        if (arrow) {
            top = range.getBoundingClientRect().top;
            savedRange = range.cloneRange();
            sel.modify("move", up ? "backward" : "forward", "line");
            console.log("down", top, up ? "up" : "down");
        }
    }
    function rangePress (ev) {
        var sel = window.getSelection()
        ,   range = sel.getRangeAt(0)
        ,   atBoundary = (top - range.getBoundingClientRect().top) === 0
        ,   kc = ev.keyCode
        ,   up = kc === 38
        ,   dn = kc === 40
        ,   lf = kc === 37
        ,   rt = kc === 39
        ,   arrow = up || dn || lf || rt
        ,   ud = up || dn
        ;
        if (ud && atBoundary) {
            console.log("at boundary");
            // XXX
            //  fire an event indicating direction
            //  the default behaviour is to go to start/end of line (well, do the modify again)
            //  but it can be cancelled
            //  turn this into a proper implementation of the idea from the Substance guys
            //  see if this works on other browsers too
            //  apply to all data-cursorable
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
        if (ud) ev.preventDefault();
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
