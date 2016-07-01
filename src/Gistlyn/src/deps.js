// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/index.d.ts'/>
System.register(['react', 'react-dom', 'redux', 'react-redux', 'es6-shim', 'react-codemirror'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, react_dom_1, redux_1, react_redux_1, ES6, react_codemirror_1;
    var Deps, ignore, ignoreES6, ignoreRedix;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (react_dom_1_1) {
                react_dom_1 = react_dom_1_1;
            },
            function (redux_1_1) {
                redux_1 = redux_1_1;
            },
            function (react_redux_1_1) {
                react_redux_1 = react_redux_1_1;
            },
            function (ES6_1) {
                ES6 = ES6_1;
            },
            function (react_codemirror_1_1) {
                react_codemirror_1 = react_codemirror_1_1;
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
            ignoreRedix = function () {
                var store = redux_1.createStore(function (state, action) { return null; });
                react_dom_1.render(React.createElement(react_redux_1.Provider, {store: store}, React.createElement(react_codemirror_1.default, null)), document.body);
            };
        }
    }
});
//# sourceMappingURL=deps.js.map