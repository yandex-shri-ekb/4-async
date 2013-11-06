define(function(require) {
    'use strict';

    var $ = require('jquery'),
        Config = require('app/config/ui_config');

    var Template = {
        buildProgress: require('doT!templates/build_progress'),
        buildComplete: require('doT!templates/build_complete')
    };

    var $el = {};

    return {
        cacheElements: function() {
            $el = {
                body: $(document.body),
                qtyInput: $.byId(Config.controls.qtyInputId),
                startButton: $.byId(Config.controls.startButtonId),
                resetButton: $.byId(Config.controls.resetButtonId),
                clearStorageButton: $.byId(Config.controls.clearStorageButtonId),
                statesContainer: $.byClass(Config.statesContainerClass)
            };

            return $el;
        },

        startBuild: function(number) {
            $el.statesContainer.append(Template.buildProgress({
                idPrefix: Config.stateIdPrefix,
                group: number
            }));
        },

        completeBuild: function(number) {
            $.byId(Config.stateIdPrefix + number).replaceWith(Template.buildComplete({
                group: number
            }));
        },

        clearStates: function() {
            $el.statesContainer.empty();
        }
    };
});
