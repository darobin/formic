/*global CustomEvent*/

// IMPROVEMENT
//  forget about boundary detection for now, only do:
//  - when there is a selection change, dispatch an event with the old and new. If it is cancelled,
//    set selection to the old
//  - when typing happens, dispatch an event. If it is not cancelled, let it happen, otherwise do.
//  - note that typing and all need to know what they apply to, notably deletion or insertion
//  - maybe just use an "editable" attribute for this
//  - demo usage with an MVC approach, including some basic editing commands, intercepting the
//    Enter key

// XXX
//  fire an event indicating direction

// BUG: this implementation does not work in WebKit or Blink, IE not tested yet
// BUG: when the cursor is at the start of a line, its top position is reported as being
//      on the previous line. This is clearly a bug in Gecko. It causes the problem that
//      going up detects hitting the top boundary too early; going down fails to detect it
//      the first time
// maybe I can get better results for the SOL bug by measuring the top on another
// range that is made to contain the letter *after* the offset?
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
        if (d.upDown && !ev.shiftKey) {
            var rect = d.range.getBoundingClientRect()
            ,   atBoundary = ((top - rect.top) === 0)
            ,   collapseChanged = !wasCollapsed && d.range.collapsed
            ;
            if (atBoundary && !collapseChanged) {
                // console.log("BOUNDARY:" + (d.up ? "top" : "bottom"));
                ev.currentTarget.dispatchEvent(new CustomEvent("cursed-boundary", { detail: { side: (d.up ? "top" : "bottom") }}));
                d.sel.removeAllRanges();
                d.sel.addRange(savedRange);
            }
            ev.preventDefault();
        }
        if (!d.arrow) ev.preventDefault();
    }


    window.curse = function (el) {
        el.contentEditable = true;
        el.addEventListener("keydown", rangeDown, false);
        el.addEventListener("keypress", rangePress, false);
    };
    window.bless = function (el) {
        el.contentEditable = false;
        el.removeEventListener("keydown", rangeDown, false);
        el.removeEventListener("keypress", rangePress, false);
    };
    window.curseAll = function (doc) {
        if (!doc) doc = document;
        Array.prototype.forEach.call(doc.querySelectorAll("[cursed]"), window.curse);
    };
}());
