define(function(require) {
    'use strict';

    var list;

    /**
     * Функция возвращает массив первых 100 пользователей.
     * 
     * @return {Array}
     */
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
