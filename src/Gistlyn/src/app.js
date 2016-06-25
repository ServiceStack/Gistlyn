// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/browser.d.ts'/>
System.register(['react-dom', 'react', 'react-codemirror', "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js", "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js", "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js", "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js", "./codemirror.js"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var ReactDOM, React, react_codemirror_1;
    var options, source, App;
    return {
        setters:[
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (React_1) {
                React = React_1;
            },
            function (react_codemirror_1_1) {
                react_codemirror_1 = react_codemirror_1_1;
            },
            function (_1) {},
            function (_2) {},
            function (_3) {},
            function (_4) {},
            function (_5) {}],
        execute: function() {
            options = {
                lineNumbers: true,
                matchBrackets: true,
                indentUnit: 4,
                mode: "text/x-csharp",
                extraKeys: {
                    "F11": function (cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                    },
                    "Esc": function (cm) {
                        if (cm.getOption("fullScreen"))
                            cm.setOption("fullScreen", false);
                    }
                }
            };
            source = "using System;\n\n//this is a comment\nvar a = 100;\nif (a > 100)\n{\n    Console.WriteLine(a);\n}\n";
            App = (function (_super) {
                __extends(App, _super);
                function App() {
                    _super.apply(this, arguments);
                }
                App.prototype.render = function () {
                    return (React.createElement("div", {id: "app"}, React.createElement("div", {className: "editor"}, React.createElement(react_codemirror_1.default, {value: source, options: options})), React.createElement("div", {className: "preview"}, "preview")));
                };
                return App;
            }(React.Component));
            ReactDOM.render(React.createElement(App, null), document.getElementById("content"));
        }
    }
});
//# sourceMappingURL=app.js.map