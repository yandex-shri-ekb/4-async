define(function(require) {
    'use strict';

    var $ = require('jquery'),
        Config = require('app/config/ui_config');

    var template = require('doT!templates/layout'),
        styles = require('text!../../../styles/build.css');

    var $styles = $('<style>', {
        text: styles
    });

    return {
        load: function(tagret) {
            tagret = tagret || document.body;
            $(tagret).html($styles).append(template({
                svg: Config.svgContainerClass,
                states: Config.statesContainerClass
            }));
        }
    };
});
