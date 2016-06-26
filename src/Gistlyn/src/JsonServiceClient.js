System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var JsonServiceClient;
    return {
        setters:[],
        execute: function() {
            JsonServiceClient = (function () {
                function JsonServiceClient(baseUrl) {
                    this.baseUrl = baseUrl;
                }
                JsonServiceClient.prototype.get = function (request) {
                    console.log(request);
                    return fetch("/").then(function (r) { return null; });
                };
                return JsonServiceClient;
            }());
            exports_1("JsonServiceClient", JsonServiceClient);
        }
    }
});
//# sourceMappingURL=JsonServiceClient.js.map