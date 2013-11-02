var queue = new Queue(),
    parsed_users,
    parser = new Parser($(document)),
    cache = new Cache('users'),
    retry_timeout = 5000,
    increaseTimeout = function (t) { return t * 2 },
    max_retry_attempts = 5;

chrome.extension.sendRequest({});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.action) {
        case 'buildUserTree':
            buildUserTree(request.user_number);
            break;
        }
    }
);

function buildUserTree(user_number) {
    queue.empty(),
    parsed_users = [];

    parser.getUsersUrls(user_number).forEach(function (url) {
        handleUser(url);
    });
}

function handleUser(url, timeout, attempt) {
    timeout = timeout !== undefined ? timeout : retry_timeout;
    attempt = attempt !== undefined ? attempt : 1;

    if (parsed_users.indexOf(url) !== -1) {
        return;
    }

    queue.in(url);

    if (cache.get(url)) {
        setTimeout(function () {
            sendUser(cache.get(url));
        }, 0);
        return;
    }

    $.get(url)
        .done(function (html) {
            var parser = new Parser($(html)),
                user = parser.getUser();

            cache.set(url, user);
            sendUser(user);
        })
        .fail(function () {
            if (attempt >= max_retry_attempts) {
                queue.out(url);
                return;
            }

            setTimeout(function () {
                handleUser(url, increaseTimeout(timeout), attempt + 1);
            }, timeout);
        });
}

function sendUser(user) {
    handleUser(user.parent_url);

    user.children_urls.forEach(function (child) {
        handleUser(child);
    });

    chrome.runtime.sendMessage({
        action: "userParsed",
        user: user
    });

    queue.out(user.url);
    parsed_users.push(user.url);

    if (queue.isEmpty()) {
        chrome.runtime.sendMessage({
            action: "lastUserSent"
        });
    }
}
