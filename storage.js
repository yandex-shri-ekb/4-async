'use strict';

define('storage', [], function() {
    return {
        save: function(name, obj, prefix) {
            prefix = prefix || '';
            window.localStorage.setItem(prefix + name, JSON.stringify(obj));
        },
        load: function(name, prefix) {
            prefix = prefix || '';
            var value = window.localStorage.getItem(prefix + name);
            if(value !== null) {
                return JSON.parse(value);
            }
            else {
                return null;
            }
        }
    };
});