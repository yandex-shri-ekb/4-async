'use strict';

define('user', [], function() {
    /** @class User */

    /**
     * @constructor
     * @param {string} nickname
     * @param {string} url
     */
    var User = function(nickname, url) {
        this.nickname = nickname;
        this.url = url;
        this.avatar = null;

        // загружен
        this.isLoaded = false;

        // пригласил на сайт
        this.friends = [];

        // от кого получил приглашение
        this.invitedBy = null;
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