
// this is largely a set of facilities to help with the manipulating of forms
// ideally, some of this would be made part of the platform

(function () {
    var filter = Array.prototype.filter
    // ,   forEach = Array.prototype.forEach
    ;
    var formic = {
        matches:    function (el, sels, refs) {
            return (
                    el.matches ||
                    el.mozMatchesSelector ||
                    el.webkitMatchesSelector ||
                    el.msMatchesSelector
                    ).call(el, sels, refs);
        }
    ,   ancestors:  function (el) {
            var ret = [];
            while (el.parentNode.nodeType === Node.ELEMENT_NODE) {
                ret.push(el.parentNode);
                el = el.parentNode;
            }
            return ret;
        }
    ,   submittableElements:    function (form) {
            return filter.call( document.querySelectorAll("button, input, keygen, object, select, textarea")
                            ,   function (el) {
                                    return form === el.form;
                                }
                            );
        }
    ,   disabled:   function (el) {
            return formic.matches(el, ":disabled");
        }
    ,   formDataSet:    function (form) {
            var controls = formic.submittableElements(form)
            ,   dataSet = []
            ;
            for (var i = 0, n = controls.length; i < n; i++) {
                var field = controls[i];
                // Fields To Skip
                // We don't check that objects must have loaded a plugin. Bite me.
                // Since this is batched, we also don't know the submitter and therefore ignore them all
                if (formic.ancestors(field).filter(function (el) { el.tagName.toLowerCase() === "datalist"; }).length) continue;
                if (formic.disabled(field)) continue;
                if (field.type === "submit" || field.type === "image" || field.type === "button") continue;
                if (field.type === "checkbox" && !field.checked) continue;
                if (field.type === "radio" && !field.checked) continue;
                if (field.type !== "image" && !field.name) continue;

                // XXX take files into account

            }
            return dataSet;
        }
    };
    
    window.formic = formic;
}());
