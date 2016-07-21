System.register(['react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var SaveAsDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            SaveAsDialog = (function (_super) {
                __extends(SaveAsDialog, _super);
                function SaveAsDialog() {
                    _super.apply(this, arguments);
                }
                SaveAsDialog.prototype.render = function () {
                    var _this = this;
                    var description = this.props.description;
                    if (this.txtDescription) {
                        description = this.txtDescription.value;
                    }
                    else {
                        setTimeout(function () { return _this.txtDescription.select(); }, 0);
                    }
                    return (React.createElement("div", {id: "dialog", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {className: "dialog", ref: function (e) { return _this.props.dialogRef(e); }, onClick: function (e) { return e.stopPropagation(); }}, React.createElement("div", {className: "dialog-header"}, React.createElement("i", {className: "material-icons close", onClick: function (e) { return _this.props.onHide(); }}, "close"), this.props.shouldFork ? "Fork" : "Save", " Gist"), React.createElement("div", {className: "dialog-body"}, React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "txtDescription"}, "Description"), React.createElement("input", {ref: function (e) { return _this.txtDescription = e; }, type: "text", id: "txtDescription", defaultValue: description, onKeyUp: function (e) { return _this.forceUpdate(); }, onKeyDown: function (e) { return e.keyCode == 13 && description ? _this.props.onSave({ description: description }) : null; }, autoFocus: true})), React.createElement("div", {className: "row", style: { color: this.props.isPublic ? "#4CAF50" : "#9C27B0" }, title: "This gist is " + (this.props.isPublic ? "public" : "private")}, React.createElement("label", null), React.createElement("i", {className: "material-icons", style: { verticalAlign: "bottom", marginRight: 5, fontSize: 20 }}, "check"), "Is ", this.props.isPublic ? "public" : "private")), React.createElement("div", {className: "dialog-footer"}, React.createElement("img", {className: "loading", src: "/img/ajax-loader.gif", style: { margin: "5px 10px 0 0" }}), React.createElement("span", {className: "btn" + (description ? "" : " disabled"), onClick: function (e) { return description ? _this.props.onSave({ description: description }) : null; }}, "Create ", this.props.shouldFork ? "Fork" : "Gist")))));
                };
                return SaveAsDialog;
            }(React.Component));
            exports_1("default", SaveAsDialog);
        }
    }
});
//# sourceMappingURL=SaveAsDialog.js.map