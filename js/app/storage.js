'use strict';

define([], function() {
    return {
        save: function(name, obj, prefix) {
            prefix = prefix || '';
            window.localStorage.setItem(prefix + name, JSON.stringify(obj));

            return this;
        },
        load: function(name, prefix, factory) {
            prefix = prefix || '';
            var value = window.localStorage.getItem(prefix + name);
            if(value !== null) {
                var data = JSON.parse(value);
                if(factory !== undefined) {
                    return factory.create(data);
                }
                else {
                    return data;
                }
            }
            else {
                return null;
            }
        },
        clear: function() {
            window.localStorage.clear();

            return this;
        },
        remove: function(name, prefix) {
            prefix = prefix || '';
            window.localStorage.removeItem(prefix + name);

            return this;
        }
    };
});