define(function(require) {
    'use strict';

    var $ = require('jquery'),
        Config = require('app/config/ui_config'),
        States = require('./states');

    var Template = {
        storageInfo: require('doT!templates/storage_info')
    };

    var $el = {};

    return {
        cacheElements: function() {
            $el = {
                qtyInput: $.byId(Config.controls.qtyInputId),
                startButton: $.byId(Config.controls.startButtonId),
                resetButton: $.byId(Config.controls.resetButtonId),
                clearStorageButton: $.byId(Config.controls.clearStorageButtonId),
                storageInfo: $.byId(Config.controls.storageInfoId),
            };

            return $el;
        },

        prepareBuild: function(number) {
            States.createState(number, 'buildPrepare');
        },

        startBuild: function(number) {
            States.changeState(number, 'buildProgress');
        },

        completeBuild: function(number) {
            States.changeState(number, 'buildComplete');
        },

        clearStates: States.clear,

        setGroups: function(count) {
            $el.storageInfo.html(Template.storageInfo({
                count: count
            }));
        }
    };
});
