System.register(['react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var ConsoleViewerDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            ConsoleViewerDialog = (function (_super) {
                __extends(ConsoleViewerDialog, _super);
                function ConsoleViewerDialog() {
                    _super.apply(this, arguments);
                }
                ConsoleViewerDialog.prototype.render = function () {
                    var _this = this;
                    setTimeout(function () { return _this.dialog && (_this.dialog.scrollTop = _this.dialog.scrollHeight); }, 0);
                    return (React.createElement("div", {id: "dialog", className: "console-viewer dark console", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {className: "dialog", ref: function (e) { return _this.props.dialogRef(_this.dialog = e); }, onClick: function (e) { return e.stopPropagation(); }, style: { maxHeight: "90%", maxWidth: "90%", overflow: "auto", borderRadius: 0 }}, React.createElement("div", {className: "dialog-header", style: { margin: 0 }}, React.createElement("span", {onClick: function (e) { return _this.props.onHide(); }}, "close"), React.createElement("span", {onClick: function (e) { return _this.dialog.scrollTop = _this.dialog.scrollHeight; }}, "scroll down"), React.createElement("span", {onClick: function (e) { return _this.props.onClear(); }}, "clear"), "Console Logs"), React.createElement("div", {className: "dialog-body", style: { padding: 10 }}, React.createElement("table", {style: { width: "100%" }, className: "console"}, React.createElement("tbody", null, this.props.logs.map(function (log) { return (React.createElement("tr", null, React.createElement("td", {style: { padding: "2px 8px", tabSize: 4 }}, React.createElement("pre", {className: log.cls}, log.msg)))); })))), React.createElement("div", {className: "dialog-footer"}, React.createElement("p", {style: { paddingBottom: 15 }}, React.createElement("span", {onClick: function (e) { return _this.props.onHide(); }}, "close"), React.createElement("span", {onClick: function (e) { return _this.dialog.scrollTop = 0; }}, "scroll up"))))));
                };
                return ConsoleViewerDialog;
            }(React.Component));
            exports_1("default", ConsoleViewerDialog);
        }
    }
});
//# sourceMappingURL=ConsoleViewerDialog.js.map