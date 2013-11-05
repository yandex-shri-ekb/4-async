'use strict';

define('user', [], function() {
    /** @class User */

    /**
     * @constructor
     * @param {string} nickname
     * @param {?string} url
     */
    var User = function(nickname, url) {
        this.nickname = nickname;
        this.url = url || '/users/' + nickname + '/';
        this.avatar = null;

        // пригласил на сайт
        this.friends = [];

        // от кого получил приглашение
        this.invitedBy = null;

        // был ли пользователь получен из storage
        this.__storage = false;
    };

    /**
     * @function
     * @param {User} friend
     */
    User.prototype.addFriend = function(friend) {
        this.friends.push(friend);
    };

    return User;
});