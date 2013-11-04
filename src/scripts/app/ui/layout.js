define(function(require) {
    'use strict';

    var $ = require('jquery');

    var template = require('doT!templates/layout'),
        styles = require('text!../../../styles/build.css');

    var $styles = $('<style>', {
        text: styles
    });

    return {
        load: function(tagret) {
            tagret = tagret || document.body;
            $(tagret).html($styles).append(template());
        }
    };
});
