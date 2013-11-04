define(function(require) {
    'use strict';

    var list;

    var parse = function() {
        return $('.username a').map(function(i, el) {
            return el.textContent;
        }).get();
    };

    return {
        get: function() {
            return list ? list : (list = parse());
        }
    };
});
