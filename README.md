# Граф приглашений habrahabr.ru

## Proof of concept

1. На странице http://habrahabr.ru/users/ открыть консоль и скопировать в неё содержимое скрипта main.js.

2. Выполнить функцию buildUsersTree(N), где N -- количество пользователей, которые должны присутствовать в дереве.

А вот и <a href="javascript: function buildUsersTree(number){var cache={},tree={};function getUser(url,parentNode,callback){if(cache.hasOwnProperty(url)){callback(cache[url],parentNode);return}$.get(url,function(document){var $document=$(document),user={url:url,name:$document.find('h2.username').text(),img:$document.find('img[alt=\'avatar\']').attr('src'),parent:$document.find('#invited-by').attr('href'),children:$document.find('[rel=\'friend\']').map(function(){return $(this).attr('href')})};cache[url]=user;callback(user,parentNode)})} function getUserCallback(user,parentNode){var i;parentNode[user.url]={};$('body').trigger('new_node',user);for(i=0;i<user.children.length;i+=1)getUser(user.children[i],parentNode[user.url],getUserCallback)}function findRoot(url,callback){getUser(url,{},function(user){if(user.parent)findRoot(user.parent,callback);else callback(user)})}function objLength(obj){var length=0;for(var i in obj)if(obj.hasOwnProperty(i))length+=1;return length}function drawTree(level,tree){var length=objLength(tree);for(var i in tree)if(tree.hasOwnProperty(i)){length-= 1;drawLeaf(level,cache[i].name,length===0);drawTree(level+1,tree[i])}}function drawLeaf(level,value,isLastChild){var prefix=level===0?'':isLastChild?'┗ ':'┝ ';while(level>1){prefix='┃ '+prefix;level-=1}console.log(prefix+value)}var users=$('.username > a').slice(0,number).map(function(){return $(this).attr('href')});for(var i=0;i<users.length;i+=1)findRoot(users[i],function(user){getUser(user.url,tree,getUserCallback)});$('body').on('new_node',function(e,user){console.clear();drawTree(0,tree)})}buildUsersTree(3); void 0;">букмарклет</a>. 

## Задание

Вам нужно написать [букмарклет](http://ru.wikipedia.org/wiki/Букмарклет), который будет запускаться в браузере на странице http://habrahabr.ru/users/ и который для первых N пользователей страницы http://habrahabr.ru/users/ построит и визуализирует граф приглашений на Хабр. 

Пользователи Хабра могут:
 - регистрироваться сами (тогда они будут являться корнем дерева) 
 - могут быть приглашены на сайт другим пользователем (тогда они будут являться узлом дерева)
 - пользователи могут никого не приглашать (тогда они будут являться листьями дерева)

Дерево считается завершенным, когда оно имеет корень и все его концевые узлы являются листьями.

Пример: возьмем пользователя [Zelenyikot](http://habrahabr.ru/users/Zelenyikot/) он был приглашен на сайт пользоваттелем [tyr](http://habrahabr.ru/users/tyr/) и пригласил на сайт AntiInvader, Astrok, Biverofevil, vnnspace и других пользователей. В этом дереве tyr является корнем дерева (сам зарегистрировался), Zelenyikot узлом (был приглашен tyr), а vnnspace является листом этого дерева.

Сокращенная запись этого дерева будет выглядеть так:

```
tyr
  ├── Zelenyikot
  │   ├── Biverofevil
  |   ├── ...
  │   └── vnnspace
  |
  └── art3x
      └── ...
```

Результатом выполнения задания должен быть 1 файл, который по возможности не должен загружать внешние зависимости.

Плюсами будут
 - Разбиение проекта на модули (CJS, AMD, ...)
 - Использование Promise ($.Deferred) для асинхронных операций
 - Сборка модулей в 1 бандл (Gruntfile)
   - AMD+r.js, CJS+browserify, CJS+LMD
 - Анимация процесса загрузки и парсинга страниц
 - Анимация процесса построения дерева (перестраивать дерево по мере загрузки страниц)
 - Визуализация узла (иконка и имя пользователя минимум)
 - Динамический рассчет высоты дерева
 - Использование библиотек для визуализации данных (d3.js)
 - Кэширование собранных данных в localStorage
