define(function(require) {
    'use strict';

    var $ = require('jquery');

    $.byId = function(id) {
        return $(document.getElementById(id));
    };

    $.byClass = function(className) {
        return $(document.getElementsByClassName(className));
    };

    return {
        svgContainerClass: 'layout_container-svg',
        statesContainerClass: 'states',
        stateIdPrefix: 'state',
        controls: {
            qtyInputId: 'control_qty',
            startButtonId: 'control_start',
            resetButtonId: 'control_reset',
            clearStorageButtonId: 'control_clear-storage',
            storageInfoId: 'control_storage-info'
        }
    };
});
