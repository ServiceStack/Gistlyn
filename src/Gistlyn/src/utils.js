System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var splitOnFirst, queryString;
    return {
        setters:[],
        execute: function() {
            exports_1("splitOnFirst", splitOnFirst = function (s, c) {
                if (!s)
                    return [s];
                var pos = s.indexOf(c);
                return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s];
            });
            exports_1("queryString", queryString = function (url) {
                if (!url || url.indexOf('?') === -1)
                    return {};
                var pairs = splitOnFirst(url, '?')[1].split('&');
                var map = {};
                for (var i = 0; i < pairs.length; ++i) {
                    var p = pairs[i].split('=');
                    map[p[0]] = p.length > 1
                        ? decodeURIComponent(p[1].replace(/\+/g, ' '))
                        : null;
                }
                return map;
            });
        }
    }
});
//# sourceMappingURL=utils.js.map