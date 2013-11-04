define(function(require) {
    'use strict';

    var Adapter = function(prefix) {
        this.prefix = prefix ? prefix + '.' : '';
        this.isEnabled = this.isSupported();
    };

    Adapter.prototype = {
        isSupported: function() {
            var data = 'test';
            try {
                localStorage.setItem(data, data);
                localStorage.removeItem(data);
                return true;
            } catch(ex) {
                return false;
            }
        },

        getKey: function(key) {
            if (typeof key === 'object') {
                key = key.prefix + '.' + key.key;
            }
            return this.prefix + key;
        },

        set: function(key, value) {
            this.isEnabled && localStorage.setItem(this.getKey(key), JSON.stringify(value));
            return this;
        },

        get: function(key) {
            return this.isEnabled ? JSON.parse(localStorage.getItem(this.getKey(key))) : {};
        },

        clear: function() {
            this.isEnabled && localStorage.clear();
            return this;
        }

    };

    return Adapter;
});
