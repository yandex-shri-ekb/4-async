'use strict';

require.config({
    waitSeconds : 30,
    paths : {
        text       : '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text.min',
        jquery     : '//yandex.st/jquery/1.10.2/jquery.min',
        d3         : 'http://d3js.org/d3.v3.min',
        app        : 'app',
        cache      : 'cache',
        tree       : 'tree'
    },
    shim : {
        d3 : {
            exports : 'd3'
        }
    }
});

require([
    'jquery',
    'app'
], function($, App) {

    // Пользователи, которые портят граф или вообще всё
    var blackList = [
        'Ronnie83', // приглашён на сайт сразу двумя пользователями maovrn и shifttstas
        'Milla',    // приглашён на сайт пользователем tangro
        'tangro'    // приглашён на сайт пользователем Milla
    ];

    var app = new App({
        usersUrl :  '/users/',
        blackList : blackList,
        userCount : +document.body.getAttribute('count'),
        gui : {
            statusText  : '#status',
            queueLength : '#queue-length',
            cacheLength : '#cache-length',
            clearButton : '#clear-cache'
        }
    });

    app.start();

});