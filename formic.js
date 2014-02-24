
// this is largely a set of facilities to help with the manipulating of forms
// ideally, some of this would be made part of the platform

(function () {
    var filter = Array.prototype.filter
    ,   forEach = Array.prototype.forEach
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
    ,   formDataSet:    function (form, options) {
            options = options || {};
            var controls = formic.submittableElements(form)
            ,   dataSet = []
            ;
            for (var i = 0, n = controls.length; i < n; i++) {
                var field = controls[i];
                // Fields To Skip
                // We don't check that objects must have loaded a plugin. Bite me.
                // Since this is batched, we also don't know the submitter and therefore ignore them all
                if (formic.ancestors(field).filter(function (el) { formic.matches(el, "datalist"); }).length) continue;
                if (formic.disabled(field)) continue;
                if (formic.matches(field, "button")) continue;
                if (field.type === "submit" || field.type === "image" || field.type === "button") continue;
                if (field.type === "checkbox" && !field.checked) continue;
                if (field.type === "radio" && !field.checked) continue;
                if (!field.name) continue;
                var type = field.type, name = field.name;
                
                if (formic.matches(field, "select")) {
                    // XXX this should be "> option, > optgroup > option" but it can't be
                    forEach.call(field.querySelectorAll("option")
                            ,    function (el) {
                                    if (!el.disabled && el.selected)
                                        dataSet.push({
                                            name:   name
                                        ,   type:   type
                                        ,   value:  el.value
                                        ,   el:     el
                                        });
                                }
                    );
                }
                
                else if (type === "checkbox" || type === "radio") {
                    var value;
                    if (field.hasAttribute("value")) value = field.getAttribute("value");
                    else if (options.booleanChecked) value = true;
                    else value = "on";
                    dataSet.push({
                        name:   name
                    ,   type:   type
                    ,   value:  value
                    ,   el:     field
                    });
                }

                else if (type === "file") {
                    if (field.files.length === 0) {
                        dataSet.push({ name: name, type: "application/octet-stream", value: "", el: field });
                    }
                    else {
                        forEach.call(field.files
                                ,    function (f) {
                                        dataSet.push({
                                            name:   name
                                        ,   type:   type
                                        ,   value: {
                                                type:   f.type
                                            ,   name:   f.name
                                            ,   body:   f
                                            }
                                        ,   el: field
                                        });
                                     }
                        );
                    }
                }
                // here we could process <object>. but we won't
                
                else {
                    dataSet.push({
                        name:   name
                    ,   type:   type
                    ,   value:  field.value
                    ,   el:     field
                    });
                }
                
                if (type === "textarea" || type === "text" || type === "search") {
                    if (field.getAttribute("dirname")) {
                        // here we should fully determine the directionality, but we cheat
                        dataSet.push({
                            name:   field.getAttribute("dirname")
                        ,   type:   "direction"
                        ,   value:  field.dir || "auto"
                        ,   el:     field
                        });
                    }
                }
            }
            
            // clean up the CRLF
            for (var i = 0, n = dataSet.length; i < n; i++) {
                var d = dataSet[i];
                if (d.type === "textarea" || d.type === "file") continue;
                if (typeof d.value !== "string") continue;
                d.value = d.value
                           .replace(/\r(?!\n)/g, "\r\n")
                           .split("").reverse().join("") // where the fuck are my lookbehinds?
                           .replace(/\n(?!\r)/, "\n\r")
                           .split("").reverse().join("")
                ;
            }
            
            return dataSet;
        }
    };
    
    window.formic = formic;
}());
