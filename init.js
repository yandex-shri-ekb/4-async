require.config({
    paths: {
        'jquery': '//yandex.st/jquery/2.0.3/jquery.min',
        'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.3.9/d3.min',//'http://d3js.org/d3.v3.min',
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

    var $body = $(document.body);

    // Определим на той ли странице мы находимся
    if(document.URL.indexOf('habrahabr.ru/users') === -1) {
        alert('Необходимо находиться на странице http://habrahabr.ru/users/ для построения графа');
        return;
    }

    var $peoples = $('#peoples', $body),
        users = [];

    // находим пользователей, с которых начнем строить наше дерево
    $peoples.find('.user:lt(' + INIT_USER_AMOUNT + ')').each(function() {
        var $user = $(this),
            $link = $user.find('.username a'),
            $avatar = $user.find('.avatar img'),
            user = new User($link.text().trim(), $link.attr('href'), $avatar.attr('src'));
        users.push(user);
    });

    // очистим текущую страницу
    $body.html('').show();

    // запустим наше приложение
    var app = new App();
    app.init(users);
});