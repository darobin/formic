/*global formic*/

(function () {
    function parseSteps (name) {
        var steps = []
        ,   orig = name // keep in case parsing fails
        ,   ok = false
        ;
        name = name.replace(/^([^\[]+)/, function (m, p1) {
            steps.push({ type: "root", val: p1 });
            ok = true;
            return "";
        });
        if (!ok) return [{ type: "root", val: orig, last: true }];
        if (!name.length) {
            steps[0].last = true;
            return steps;
        }

        while (name.length) {
            var ok = false;
            name = name.replace(/^\[\]/, function () {
                steps.push({ type: "append" });
                ok = true;
                return "";
            });
            if (ok) continue;
            name = name.replace(/^\[(\d+)\]/, function (m, p1) {
                steps.push({ type: "array", val: (1 * p1) });
                ok = true;
                return "";
            });
            if (ok) continue;
            name = name.replace(/^\[([^\]]+)\]/, function (m, p1) {
                steps.push({ type: "object", val: p1 });
                ok = true;
                return "";
            });
            if (ok) continue;
            return [{ type: "root", val: orig, last: true }];
        }

        steps[steps.length - 1].last = true;
        return steps;
    }
    window.applicationJSON = function (form) {
        var data = formic.formDataSet(form)
        ,   ret = {}
        ;
        for (var i = 0, n = data.length; i < n; i++) {
            var item = data[i]
            ,   steps = parseSteps(item.name)
            ;
            console.log(steps);
        }
        
        return ret;
    };
}());

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

// for checkbox & radio, maybe we can default to true here instead of "on" when there is no value
