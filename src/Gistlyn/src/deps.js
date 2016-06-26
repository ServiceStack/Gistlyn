System.register(['react', 'react-dom', 'es6-shim'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, react_dom_1, ES6;
    var Deps, ignore, ignoreES6;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (react_dom_1_1) {
                react_dom_1 = react_dom_1_1;
            },
            function (ES6_1) {
                ES6 = ES6_1;
            }],
        execute: function() {
            Deps = (function (_super) {
                __extends(Deps, _super);
                function Deps() {
                    _super.apply(this, arguments);
                }
                Deps.prototype.render = function () {
                    return React.createElement("div", null, "Hello, World!");
                };
                return Deps;
            }(React.Component));
            ignore = function () { return react_dom_1.render(React.createElement(Deps, null), document.body); };
            ignoreES6 = function () { return new ES6.Promise(function () { return (ES6.Object.assign({}, {})); }); };
        }
    }
});
//# sourceMappingURL=deps.js.map