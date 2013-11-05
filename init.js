require.config({
    paths: {
        'jquery': '//yandex.st/jquery/2.0.3/jquery.min',
        'd3': 'http://d3js.org/d3.v3.min',
        'app': 'app',
        'user': 'user',
        'graph': 'graph',
        'storage': 'storage'
    },
    // http://stackoverflow.com/questions/13157704/how-to-integrate-d3-with-require-js
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require(['app', 'user', 'jquery'], function(App, User, $) {

    var INIT_USER_AMOUNT = 3;

    var $body = $(document.body),
        testMode = $body.data('test-mode') || false;

    // Определим на той ли странице мы находимся
    if(!testMode && document.URL.indexOf('habrahabr.ru/users') === -1) {
        alert('Необходимо находиться на странице http://habrahabr.ru/users/ для построения графа');
        return;
    }

    var $peoples = $('#peoples', $body),
        users = [];

    // находим пользователей, с которых начнем строить наше дерево
    $peoples.find('.user:lt(' + INIT_USER_AMOUNT + ') .username a').each(function() {
        var $link = $(this),
            user = new User($link.text().trim(), $link.attr('href'));
        users.push(user);
    });

    // очистим текущую страницу
    $body.html('').show();

    // и запустим наше приложение
    var app = new App({
        testMode: testMode
    });
    app.init(users);
});