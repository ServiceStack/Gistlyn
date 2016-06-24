// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/browser.d.ts'/>
System.register(['react', 'jquery'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var HelloWorld;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (_1) {}],
        execute: function() {
            HelloWorld = (function (_super) {
                __extends(HelloWorld, _super);
                function HelloWorld(props, context) {
                    _super.call(this, props, context);
                    this.state = { msg: '' };
                }
                HelloWorld.prototype.update = function (event) {
                    var _this = this;
                    var yourName = event.target.value;
                    $.getJSON("hello/" + yourName, function (r) {
                        _this.setState({ msg: r.Result });
                    });
                };
                HelloWorld.prototype.render = function () {
                    var _this = this;
                    return (React.createElement("div", {className: "form-group"}, React.createElement("input", {type: "text", placeholder: "Your name", onChange: function (e) { return _this.update(e); }, className: "form-control"}), React.createElement("h3", null, this.state.msg)));
                };
                return HelloWorld;
            }(React.Component));
            exports_1("default", HelloWorld);
        }
    }
});
//# sourceMappingURL=hello.js.map