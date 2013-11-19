(function () {
    'use strict';

    function get(url, cache, success, failure, repeat, attempt) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            var timeout;

            if (xhr.readyState !== 4) {
                return;
            }

            switch (xhr.status) {
            case 200:
                cache.set(url, xhr.responseText);
                success(xhr.responseText);
                break;
            default:
                timeout = repeat(attempt);

                if (timeout) {
                    setTimeout(function () {
                        get(url, cache, success, failure, repeat, attempt + 1);
                    }, timeout);
                } else {
                    failure(xhr.status);
                }
                break;
            }
        };

        xhr.open("GET", url, true);
        xhr.send();
    }

    exports.request = function (url, cache, success, failure, repeat) {
        var item = cache.get(url);

        if (item) {
            return success(item);
        }

        get(url, cache, success, failure, repeat, 1);
    };
}());
