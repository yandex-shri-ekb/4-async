(function() {

    var config = {
        require : '//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.9/require.min.js',
        start   : 'https://rawgithub.com/mayton/5-async/master/build/all.min.js'
    };

    if (window.location.href !== 'http://habrahabr.ru/users/') {
        alert('Для запуска сценария перейдите по адресу http://habrahabr.ru/users/');
        return;
    }

    var body = document.body;
    if (body.getAttribute('count') !== null) {
        alert('Для повторного запуска сценария необходимо обновить страницу.');
        return;
    }

    var userCount = prompt('Сколько пользователей брать для анализа?', 2);
    if (userCount === null)
        return;

    body.setAttribute('count', userCount);
    body.style.display = 'none';

    var head = document.getElementsByTagName('head')[0];
    head.innerHTML = '<title>Домашняя работа №5</title>';

    var s = document.createElement('script');
    s.setAttribute('src', config.require);
    s.setAttribute('data-main', config.start);
    head.appendChild(s);

})();
