javascript:(function() {

    var config = {
        require : '//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.9/require.min.js',
        start   : 'https://rawgithub.com/mayton/5-async/master/main.js'
    };

    var body = document.body;
    if (body.getAttribute('count') !== null) {
        alert('Для повторного запуска сценария необходимо обновить страницу.');
        return false;
    }

    var userCount = prompt('Сколько пользователей брать для анализа?', 5);
    if (userCount === null)
        return false;

    body.setAttribute('count', userCount);
    body.style.display = 'none';

    var head = document.getElementsByTagName('head')[0];
    head.innerHTML = '<title>Домашняя работа №5</title>';

    if ( ! window.requirejs) {
        var s = document.createElement('script');
        s.setAttribute('src', config.require);
        s.setAttribute('data-main', config.start);
        head.appendChild(s);
    }

})();
