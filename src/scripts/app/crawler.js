define(function(require) {
    'use strict';

    var UserProfile = require('app/parser/user_profile'),
        EventTarget = require('./event_target'),
        Store = require('app/store/store');

    var Crawler = function() {
        EventTarget.call(this);
        this.userProfileCache = {};
        this.requestDelay = 0;
    };

    Crawler.prototype = $.extend(EventTarget.prototype, {
        wait: function() {
            var d = $.Deferred();
            setTimeout(d.resolve, this.requestDelay);
            this.requestDelay += 250;
            return d.promise();
        },

        getRoot: function(url) {
            return $.ajax(url, {
                context: this
            }).then(function(response) {
                var userProfile = new UserProfile(response);
                this.userProfileCache[userProfile.url] = userProfile;
                return typeof userProfile['parent'] === 'undefined' ? userProfile : this.getRoot(userProfile.parent);
            });
        },

        getuserProfile: function (url) {
            var self = this;
            if(typeof this.userProfileCache[url] !== 'undefined') {
                return {
                    then: function(callback) {
                        callback(self.userProfileCache[url]);
                    }
                };
            }

            return this.wait().then(function() {
                return $.get(url);
            }).then(function (response) {
                return new UserProfile(response);
            });
        },

        detour: function(url, parent, group) {
            var self = this;

            group.waitPush();
            
            self.getuserProfile(url).then(function(userProfile){
                if(group.contains(userProfile.username)) {
                    group.diminish();
                    return;
                }

                group.push(userProfile.username);

                self.trigger('get:node', {
                    user: userProfile,
                    parent: parent,
                    group: group.index
                });

                userProfile.childrenUrl.forEach(function(child) {
                    self.detour(child, userProfile, group);
                });
            }, function() {
                group.diminish();
                self.detour(url, parent, group);
            });
        },

        start: function(url) {
            var self = this;

            self.getRoot(url).then(function (root) {
                var group = Store.createGroup(root.username);

                self.trigger('get:root', {
                    user: root,
                    group: group.index
                });

                root.childrenUrl.forEach(function(child) {
                    self.detour(child, root, group);
                });
            });
        }
    });

    return Crawler;
});
