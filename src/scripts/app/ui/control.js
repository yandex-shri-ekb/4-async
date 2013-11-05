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
                qtyInput: $('#control_qty'),
                startButton: $('#control_start'),
                resetButton: $('#control_reset'),
                clearStorageButton: $('#control_clear-storage'),
                statesContainer: $('.' + Config.statesContainerClass)
            };

            return $el;
        },

        startBuild: function(number) {
            $el.statesContainer.append(Template.buildProgress({
                group: number
            }));
        },

        completeBuild: function(number) {
            $('#state' + number).replaceWith(Template.buildComplete({
                group: number
            }));
        },

        clearStates: function() {
            $el.statesContainer.empty();
        }
    };
});
