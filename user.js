'use strict';

define('user', [], function() {
    /** @class User */

    /**
     * @constructor
     * @param {string} nickname
     * @param {?string} url
     * @param {?string} avatar
     */
    var User = function(nickname, url, avatar) {
        this.nickname = nickname;
        this.url = url || '/users/' + nickname + '/';
        this.avatar = avatar || null;

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