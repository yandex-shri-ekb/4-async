(function() {
    var body = document.body,
        head = document.getElementsByTagName('head')[0],
        script = document.createElement('script'),
        link = document.createElement('link'),
        src = 'https://rawgithub.com/i4got10/5-async/belousov/';
    body.style.display = 'none';
    head.innerHTML = '<title>Граф хабра-пользователей!</title><meta charset="utf-8">';
    script.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.9/require.min.js');
    script.setAttribute('data-main', src + 'init.js');
    head.appendChild(script);
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', src + 'style.css');
    head.appendChild(link);
})();

javascript:(function(){var e=document.body,t=document.getElementsByTagName("head")[0],n=document.createElement("script"),r=document.createElement("link"),i="https://rawgithub.com/i4got10/5-async/belousov/";e.style.display="none";t.innerHTML='<title>Граф хабра-пользователей!</title><meta charset="utf-8">';n.setAttribute("src","//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.9/require.min.js");n.setAttribute("data-main",i+"init.js");t.appendChild(n);r.setAttribute("rel","stylesheet");r.setAttribute("href",i+"style.css");t.appendChild(r)})()