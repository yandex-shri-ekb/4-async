'use strict';

define(['app/user'], function(User) {
    return {
        /**
         * @param {Object} data
         * @return User
         */
        create: function(data) {
            var user = new User();
            for(var prop in data) {
                if(!data.hasOwnProperty(prop)) {
                    continue;
                }

                if(typeof user[prop] !== 'undefined') {
                    user[prop] = data[prop];
                }
            }

            return user;
        },
        markAsDeleted: function(user) {
            user.isDeleted = true;
            user.avatar = '/i/avatars/stub-user-middle.gif';
        }
    };
});