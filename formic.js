/*global Element*/

(function (global) {
    // inject formic
    global.formic = function () {
        // a useful addition to elements in general
        Object.defineProperty(Element.prototype, "ancestors", {
            enumerable: true
        ,   get:    function () {
                var ret = [], el = this;
                while (el.parentNode.nodeType === Node.ELEMENT_NODE) {
                    ret.push(el.parentNode);
                    el = el.parentNode;
                }
                return ret;
            }
        });
        
        // make matches() work
        if (!Element.prototype.matches) {
            Element.prototype.matches = function (sels, refs) {
                return (this.mozMatchesSelector ||
                        this.msMatchesSelector ||
                        this.webkitMatchesSelector).call(this, sels, refs);
            };
        }

        // make form elements list their submittable elements
        Object.defineProperty(HTMLFormElement.prototype, "submittableElements", {
            enumerable: true
        ,   get:    function () {
                return this.ownerDocument
                           .querySelectorAll("button, input, keygen, object, select, textarea")
                           .filter(function (el) {
                               return el.form === this;
                           });
            }
        });

        // return the form's data set
        // XXX we don't have a notion of "submitter" for buttons; we should
        Object.defineProperty(HTMLFormElement.prototype, "formDataSet", {
            enumerable: true
        ,   get:    function () {
                var controls = this.submittableElements
                ,   dataSet = []
                ;
                for (var i = 0, n = controls.length; i < n; i++) {
                    var field = controls[i];
                    // skip element
                    // we don't check that objects must have loaded a plugin. Bite me.
                    if (field.ancestors.filter(function (el) { el.tagName.toLowerCase() === "datalist"; }).length ||
                        field.disabled ||
                        (
                            field.matches("button[type='submit'], input[type='submit'], input[type='image'], input[type='button']") &&
                            field !== this.submitter
                        ) ||
                        (field.type === "checkbox" && !field.checked) ||
                        (field.type === "radio" && !field.checked) ||
                        (field.type !== "image" && !field.name)
                    ) continue;
                    if (field.type === "image") {
                        var name = field.name ? field.name + "." : ""
                        ,   nameX = name + "x"
                        ,   nameY = name + "y"
                        ;
                        if (field === this.submitter) {
                            // XXX we don't have that information
                            dataSet.push({ name: nameX, value: "0", type: "image" });
                            dataSet.push({ name: nameY, value: "0", type: "image" });
                            continue;
                        }
                    }
                }
                return dataSet;
            }
        });
    };
}(window));
