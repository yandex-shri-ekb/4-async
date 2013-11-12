'use strict';

define([], function() {
    /** @class User */

    /**
     * @constructor
     * @property {string} nickname
     * @property {string} [url]
     * @property {string} [avatar=null]
     */
    var User = function(nickname, url, avatar) {
        this.nickname = nickname;
        this.url = url || '/users/' + nickname + '/';
        this.avatar = avatar || null;

        /**
         * пригласил на сайт
         * @type {User[]}
         */
        this.friends = [];

        /**
         * от кого получил приглашение
         * @type {User}
         */
        this.invitedBy = null;

        /**
         * Вы пытаетесь открыть профиль пользователя, который был деактивирован/удален.
         * http://habrahabr.ru/users/budden/
         * @type {boolean}
         */
        this.isDeleted = false;

        /**
         * был ли пользователь получен из storage
         * @type {boolean}
         */
        this.__storage = false;
    };

    /**
     * @param {User} friend
     */
    User.prototype.addFriend = function(friend) {
        this.friends.push(friend);
    };

    /**
     */
    User.prototype.markAsDeleted = function() {
        this.isDeleted = true;
        this.avatar = '/i/avatars/stub-user-middle.gif';
    };

    return User;
});