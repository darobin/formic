
(function (global) {
    var Formic = function (form) {
        this.form = form;
    };
    Formic.prototype = {
        // return a list of submittable elements for this form
        // this isn't live, we'll do mutations later
        submittableElements: function () {
            
        }
        // construct and return the data set for this form
        // not live at this point, we'll set up a version that decorates the form later
    ,   formDataSet:    function () {
            
        }
        // returns the proper (JSON+files) data structure for this form
    ,   toData: function () {
            
        }
        // encodes for submission
        // that's simple JSON if there are no files, JSON+multipart otherwise
    ,   encode: function () {
            
        }
    };
    
    
    global.formic = function (form) {
        return new Formic(form);
    };
}(window));
