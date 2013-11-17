require.config({
    paths: {
        jquery: '//yandex.st/jquery/2.0.3/jquery.min',
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.3.9/d3.min',//'http://d3js.org/d3.v3.min',
        app: 'app'
    },
    // http://stackoverflow.com/questions/13157704/how-to-integrate-d3-with-require-js
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require(['app/init']);