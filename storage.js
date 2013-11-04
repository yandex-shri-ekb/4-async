'use strict';

define('storage', [], function() {
    return {
        save: function(name, obj, prefix) {
            prefix = prefix || '';
            window.localStorage.setItem(prefix + name, JSON.stringify(obj));
        },
        load: function(name, prefix) {
            prefix = prefix || '';
            JSON.parse(window.localStorage.getItem(prefix + name));
        }
    };
});