
// XXX
//  fire an event indicating direction
//  the default behaviour is to go to start/end of line (well, do the modify again)
//  but it can be cancelled
//  turn this into a proper implementation of the idea from the Substance guys
//  see if this works on other browsers too
//  apply to all data-cursorable
//  move everything around to have a gh-pages with the hacking published
//  have each bit in its own module, this one is cursed.js



// XXX this implementation does not work in WebKit or Blink, IE not tested yet
(function () {
    var top = NaN
    ,   savedRange
    ,   wasCollapsed
    ;
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
        var rect = d.range.getBoundingClientRect();
        top = rect.top;
        wasCollapsed = d.range.collapsed;
        d.sel.modify("move", d.up ? "backward" : "forward", "line");
        savedRange = d.range.cloneRange();
    }
    function rangePress (ev) {
        var d = details(ev);
        if (!d.upDown) return;
        if (ev.shiftKey) return;
        var rect = d.range.getBoundingClientRect()
        ,   atBoundary = ((top - rect.top) === 0)
        ,   collapseChanged = !wasCollapsed && d.range.collapsed
        ;
        if (atBoundary && !collapseChanged) {
            console.log("BOUNDARY:" + (d.up ? "top" : "bottom"));
            d.sel.removeAllRanges();
            d.sel.addRange(savedRange);
        }
        ev.preventDefault();
    }
    
    var x2 = document.getElementById("x2");
    x2.addEventListener("keydown", rangeDown, false);
    x2.addEventListener("keypress", rangePress, false);
}());

// the problem occurs when we are at the start of the selection

// have selection to top line, press Up (cursor goes to beginning of line)
//  rangeDown top=83, wasCollapsed=false
//  rangePress atBoundary=true, collapseChanged=true, top=83, wasCollapsed=false
// press Down
//  rangeDown top=83, wasCollapsed=true
//  rangePress atBoundary=true, collapseChanged=false, top=83, wasCollapsed=true
// at boundary bottom


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





