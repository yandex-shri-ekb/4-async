'use strict';

require(['app/app', 'app/user', 'app/storage', 'jquery'], function(App, User, storage, $) {

    var INIT_USER_AMOUNT = storage.load('init_user_amount', 'settings.') || 3;

    var $body = $(document.body);

    // Определим на той ли странице мы находимся
    if(document.URL.indexOf('habrahabr.ru/users') === -1) {
        alert('Необходимо находиться на странице http://habrahabr.ru/users/ для построения графа');
        return;
    }

    var $peoples = $('#peoples', $body),
        users = [];

    // находим пользователей, с которых начнем строить наше дерево
    $peoples.find('.user').each(function() {
        var $user = $(this),
            $link = $user.find('.username a'),
            $avatar = $user.find('.avatar img'),
            user = new User($link.text().trim(), $link.attr('href'), $avatar.attr('src'));
        users.push(user);
    });

    // очистим текущую страницу
    $body.html('').show();

    var app = new App();

    initControls();

    var $canvas = $('<div id="canvas"></div>').appendTo($body);

    // запустим наше приложение
    app.init($canvas, users.slice(0, INIT_USER_AMOUNT));

    /**
     */
    function initControls() {
        var $controls = $('<div id="controls"></div>').appendTo($body);

        $('<button id="btn-start">start</button>')
            .appendTo($controls)
            .on('click', function() {
                app.start();
                return false;
            });

        $('<button id="btn-stop">stop</button>')
            .appendTo($controls)
            .on('click', function() {
                app.stop();
                return false;
            });

        $('<button id="btn-continue">resume</button>')
            .appendTo($controls)
            .on('click', function() {
                app.resume();
                return false;
            });

        var $qty = $('<select id="btn-init-qty"></select>')
            .appendTo($controls)
            .on('change', function() {
                var $select = $(this),
                    val = +$select.val(),
                    prev = +$select.data('current');

                if(app.isStarted === false || val < prev) {
                    //alert
                    app.reset(users.slice(0, val));
                }
                else {
                    users.slice(prev, val).forEach(function(user) {
                        app.addToQueue(user, 'high')
                    });
                }

                $select.data('current', val);

                storage.save('init_user_amount', val, 'settings.')
            });

        for(var i = 1; i <= 100; i++) {
            $('<option></option>').text(i).val(i).appendTo($qty);
        }

        $qty
            .find('[value=' + INIT_USER_AMOUNT + ']')
            .attr('selected', 'selected')
            .data('current', INIT_USER_AMOUNT);
    }
});