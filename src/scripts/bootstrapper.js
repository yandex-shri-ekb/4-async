'use strict';

require.config({
    shim: {
        d3: {
            exports: 'd3'
        }
    },

    paths: {
        'jquery': './vendors/jquery',
        'd3': './vendors/d3',
        'doTCompiler': './vendors/doT',
        'text': './vendors/require/require.text',
        'doT': './vendors/require/require.doT'
    }
});

require(
    [
        'jquery',
        'app/ui/layout',
        'app/parser/user_list',
        'app/app'
    ],
    function($, Layout, UserList, App) {
        var userList = UserList.get();

        Layout.load();

        $(function() {
            App.start(userList);
        });
    }
);
