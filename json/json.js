/*global formic*/

(function () {
    function isArray (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    }
    function isObject (obj) {
        if (isArray(obj)) return false;
        if (typeof obj !== "object") return false;
        if (obj.constructor && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) return false;
        return true;
    }
    function parseSteps (name) {
        var steps = []
        ,   orig = name // keep in case parsing fails
        ,   ok = false
        ;
        name = name.replace(/^([^\[]+)/, function (m, p1) {
            steps.push({ type: "object", key: p1 });
            ok = true;
            return "";
        });
        if (!ok) return [{ type: "object", key: orig, last: true }];
        if (!name.length) {
            steps[0].last = true;
            return steps;
        }

        while (name.length) {
            var ok = false;
            name = name.replace(/^\[\]/, function () {
                steps[steps.length - 1].append = true;
                ok = true;
                return "";
            });
            // we had a match, but appends can only occur at the end
            if (ok) {
                if (name.length) return [{ type: "object", key: orig, last: true }];
                break;
            }
            name = name.replace(/^\[(\d+)\]/, function (m, p1) {
                steps.push({ type: "array", key: (1 * p1) });
                ok = true;
                return "";
            });
            if (ok) continue;
            name = name.replace(/^\[([^\]]+)\]/, function (m, p1) {
                steps.push({ type: "object", key: p1 });
                ok = true;
                return "";
            });
            if (ok) continue;
            return [{ type: "object", key: orig, last: true }];
        }
        
        for (var i = 0, n = steps.length; i < n; i++) {
            var step = steps[i];
            if (i + 1 < n) step.next = steps[i + 1].type;
            else step.last = true;
        }
        return steps;
    }
    function setValue (context, step, current, value, isFile) {
        if (step.last) {
            // there is no key, just set it
            if (current === undefined) context[step.key] = step.append ? [value] : value;
            // there are already multiple keys, push it
            else if (isArray(current)) context[step.key].push(value);
            // we're trying to set a scalar on an object
            else if (isObject(current) && !isFile) {
                return setValue(current, { type: "object", key: "", last: true }, current[""], value, isFile);
            }
            // there's already a scalar, pimp to array
            else context[step.key] = [current, value];
            return context;
        }
        else {
            // there is no key, just define a new object
            if (current === undefined) return context[step.key] = (step.next === "array" ? [] : {});
            // it's already an object
            else if (isObject(current)) return context[step.key];
            // there is an array, we convert its defined items to an object
            else if (isArray(current)) {
                if (step.next === "array") return current;
                else {
                    var obj = {};
                    for (var i = 0, n = current.length; i < n; i++) {
                        var item = current[i];
                        if (item !== undefined) obj[i] = item;
                    }
                    return context[step.key] = obj;
                }
            }
            // there is a scalar
            else {
                return context[step.key] = { "": current };
            }
        }
    }
    window.applicationJSON = function (form, cb) {
        var data = formic.formDataSet(form, { booleanChecked: true })
        ,   ret = {}
        ,   files = []
        ,   read = 0
        ;
        for (var i = 0, n = data.length; i < n; i++) {
            var item = data[i];
            if (item.value && item.value.body) files.push(item.value);
        }
        function done () {
            for (var i = 0, n = data.length; i < n; i++) {
                var item = data[i]
                ,   isFile = item.value && item.value.body !== undefined
                ,   steps = parseSteps(item.name)
                ,   cur = ret
                ;
                for (var j = 0, m = steps.length; j < m; j++) {
                    var step = steps[j];
                    cur = setValue(cur, step, cur[step.key], item.value, isFile);
                }
            }
            cb(ret);
        }
        function readNextFile (f) {
            var fr = new FileReader();
            fr.onloadend = function () {
                if (fr.error) throw fr.error;
                f.body = fr.result.replace(/^.*?,/, "");
                read++;
                if (read === files.length) done();
            };
            fr.readAsDataURL(f.body);
        }
        for (var i = 0, n = files.length; i < n; i++) readNextFile(files[i]);
        if (!files.length) done();
    };
}());

// XXX
// - use structured field names as commonly employed in PHP
// - foo -> { foo: "val" }
// - foo, foo (multiple fields with that name, select, etc.) -> { foo: ["val", "val"] }
// - foo[1] -> { foo: [null, "val"] }
// - foo[bar] -> { foo: { bar: "val" }}
// - foo[bar][0] -> { foo: { bar: ["val"] }}
// - steps are created along the way
// - this can create conflicts
//     - <input name=foo value=x>
//       <input name=foo[bar] value=y>
//         -> { foo: { "": "x", bar: "y" }}
//     - <input name=foo[bar] value=x>
//       <input name=foo[0] value=y>
//         -> { foo: { 0: "x", bar: "y" }}
//     - <input name=foo value=x>
//       <input name=foo[0] value=y>
//         -> { foo: { "": "x", 0: "y" }}
// - if error in the syntax, just use the string as is
