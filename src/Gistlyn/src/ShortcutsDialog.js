System.register(['react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var ShortcutsDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            ShortcutsDialog = (function (_super) {
                __extends(ShortcutsDialog, _super);
                function ShortcutsDialog() {
                    _super.apply(this, arguments);
                }
                ShortcutsDialog.prototype.render = function () {
                    var _this = this;
                    return (React.createElement("div", {id: "dialog", className: "shortcuts dark", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {className: "dialog", ref: function (e) { return _this.props.dialogRef(e); }, onClick: function (e) { return e.stopPropagation(); }}, React.createElement("div", {className: "dialog-header"}, React.createElement("i", {className: "material-icons close", onClick: function (e) { return _this.props.onHide(); }}, "close"), "Keyboard shortcuts"), React.createElement("div", {className: "dialog-body"}, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null), React.createElement("td", null, React.createElement("h4", null, "Editor Shortcuts"))), React.createElement("tr", null, React.createElement("th", null, React.createElement("b", null, "<Ctrl>"), React.createElement("span", null, " + "), React.createElement("b", null, "<Enter>"), React.createElement("i", null, ":")), React.createElement("td", null, "Run")), React.createElement("tr", null, React.createElement("th", null, React.createElement("b", null, "<Ctrl>"), React.createElement("span", null, " + "), React.createElement("b", null, "<S>"), React.createElement("i", null, ":")), React.createElement("td", null, "Save")), React.createElement("tr", null, React.createElement("th", null, React.createElement("b", null, "<F11>"), React.createElement("i", null, ":")), React.createElement("td", null, "Toggle Full Screen")), React.createElement("tr", null, React.createElement("th", null, React.createElement("b", null, "<Esc>"), React.createElement("i", null, ":")), React.createElement("td", null, "Exit Full Screen")), React.createElement("tr", null, React.createElement("td", null), React.createElement("td", null, React.createElement("h4", null, "Application Shortcuts"))), React.createElement("tr", null, React.createElement("th", null, React.createElement("b", null, "<Ctrl>"), React.createElement("span", null, " + "), React.createElement("b", null, "<Left>"), React.createElement("i", null, ":")), React.createElement("td", null, "Go to Previous tab")), React.createElement("tr", null, React.createElement("th", null, React.createElement("b", null, "<Ctrl>"), React.createElement("span", null, " + "), React.createElement("b", null, "<Right>"), React.createElement("i", null, ":")), React.createElement("td", null, "Go to Next tab")), React.createElement("tr", null, React.createElement("th", null, React.createElement("span", null, " ? "), React.createElement("i", null, ":")), React.createElement("td", null, "Open keyboard shortcut dialog")), React.createElement("tr", null, React.createElement("th", null, React.createElement("b", null, "<Esc>"), React.createElement("i", null, ":")), React.createElement("td", null, "Close dialog"))))))));
                };
                return ShortcutsDialog;
            }(React.Component));
            exports_1("default", ShortcutsDialog);
        }
    }
});
//# sourceMappingURL=ShortcutsDialog.js.map