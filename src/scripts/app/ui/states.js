define(function() {
    'use strict';

    var $ = require('jquery'),
        Config = require('app/config/ui_config');

    var Template = {
        buildProgress: require('doT!templates/build_progress'),
        buildComplete: require('doT!templates/build_complete'),
        buildPrepare: require('doT!templates/build_prepare')
    };

    var getTemplateData = function(number) {
        return {
            idPrefix: Config.stateIdPrefix,
            group: number
        };
    };

    var statesContainer;

    var getStateContainer = function() {
        return statesContainer ? statesContainer : (statesContainer = $.byClass(Config.statesContainerClass));
    };

    return {
        changeState: function(number, template) {
            $.byId(Config.stateIdPrefix + number).replaceWith(Template[template](getTemplateData(number)));
        },

        createState: function(number, template) {
            getStateContainer().append(Template[template](getTemplateData(number)));
        },

        clear: function() {
            getStateContainer().empty();
        }
    };
});
