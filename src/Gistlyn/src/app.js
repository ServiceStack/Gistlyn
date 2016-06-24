// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/browser.d.ts'/>
System.register(['react-dom', 'react', './hello'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ReactDOM, React, hello_1;
    return {
        setters:[
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (React_1) {
                React = React_1;
            },
            function (hello_1_1) {
                hello_1 = hello_1_1;
            }],
        execute: function() {
            ReactDOM.render(React.createElement(hello_1.default, null), document.getElementById("content"));
        }
    }
});
//# sourceMappingURL=app.js.map