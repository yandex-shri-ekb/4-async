'use strict';

require.config({
    paths : {
        'jquery'     : '//yandex.st/jquery/1.10.2/jquery.min',
        'd3'         : 'http://d3js.org/d3.v3.min',
        'app'        : 'app',
        'ls'         : 'ls',
        'tree'       : 'tree'
    },
    shim: {
        d3: {
            exports  : 'd3'
        }
    }
});

require([
    'app'
], function(App) {

    // Пользователи, которые портят граф или вообще всё
    var blackList = [
        'Ronnie83', // приглашён на сайт сразу двумя пользователями maovrn и shifttstas

        'Milla',    // приглашён на сайт пользователем tangro
        'tangro'    // приглашён на сайт пользователем Milla
    ];

    var app = new App({
        usersUrl :  '/users/',
        blackList : blackList,
        userCount : +document.body.getAttribute('count')
    });
    app.start();

});