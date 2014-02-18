
// XXX
//  fire an event indicating direction
//  the default behaviour is to go to start/end of line (well, do the modify again)
//  but it can be cancelled
//  turn this into a proper implementation of the idea from the Substance guys
//  see if this works on other browsers too
//  apply to all data-cursorable
//  check that we properly handle keyboard-based selections:
//      - by and large we do, except when going up/down. We need to handle that
//        by checking on Shift and letting the default happen then with no boundary
//        detection or manipulation. Or ideally we want boundary detection anyway, if
//        we can get away with it
//  move everything around to have a gh-pages with the hacking published
//  have each bit in its own module, this one is cursed.js


(function () {
    var top = NaN, savedRange, wasCollapsed;
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
        if (!d.upDown) return;
        if (ev.shiftKey) return;
        top = d.range.getBoundingClientRect().top;
        wasCollapsed = d.range.collapsed;
        savedRange = d.range.cloneRange();
        if (!wasCollapsed) savedRange.collapse();
        d.sel.modify("move", d.up ? "backward" : "forward", "line");
    }
    function rangePress (ev) {
        var d = details(ev);
        if (!d.upDown) return;
        if (ev.shiftKey) return;
        var atBoundary = (top - d.range.getBoundingClientRect().top) === 0
        ,   collapseChanged = !wasCollapsed && d.range.collapsed
        ;
        if (atBoundary && !collapseChanged) {
            console.log("at boundary", d.up ? "top" : "bottom");
            d.sel.removeAllRanges();
            d.sel.addRange(savedRange);
        }
        // if ((d.upDown && !ev.shiftKey && !collapseChanged) || !d.arrow)
        ev.preventDefault();
    }
    
    var x2 = document.getElementById("x2");
    x2.addEventListener("keydown", rangeDown, false);
    x2.addEventListener("keypress", rangePress, false);
}());


// Processing
//  if not up/down return from both
//  if shift key return from both


//  IF range collapsed and was collapsed
//      rangeDown: save range, try move
//      rangePress: restore range, preventDefault
//  IF range collapsed and was NOT collapsed
//      rangeDown: save a range that's at the proper side of the selection depending on direction
//                 try move
//      rangePress: restore range, preventDefault
//  IF range NOT collapsed and was collapsed
//      this should not happen since we return on shiftKey
//  IF range NOT collapsed and was NOT collapsed
//      this should not happen since we return on shiftKey



// One alternative to look into could be to use the same old code that did not take selection
// into account, and simply switch move for extend in modify() when shift is pressed?
//
// Important: check what happens when the selection is made with the mouse then navigation happens





