System.register(['react', './utils', 'react-codemirror', "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js", "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js", "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js", "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js", "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js", "./codemirror.js"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, utils_1, react_codemirror_1;
    var Editor;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (react_codemirror_1_1) {
                react_codemirror_1 = react_codemirror_1_1;
            },
            function (_1) {},
            function (_2) {},
            function (_3) {},
            function (_4) {},
            function (_5) {},
            function (_6) {}],
        execute: function() {
            Editor = (function (_super) {
                __extends(Editor, _super);
                function Editor() {
                    _super.apply(this, arguments);
                }
                Editor.prototype.render = function () {
                    var _this = this;
                    var options = {
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
                                this.props.onShortcut("Esc");
                            },
                            "Ctrl-Enter": function (cm) { return _this.props.onShortcut("Ctrl-Enter"); },
                            "Ctrl-S": function (cm) { return _this.props.onShortcut("Ctrl-S"); },
                            "Alt-S": function (cm) { return _this.props.onShortcut("Alt-S"); },
                            "Alt-C": function (cm) { return _this.props.onShortcut("Alt-C"); }
                        }
                    };
                    var source = "";
                    var files = this.props.files;
                    var Tabs = [];
                    var FileList = [];
                    if (files) {
                        var keys = utils_1.getSortedFileNames(files);
                        var sizeToFit_1 = function (e) {
                            var txt = e.target;
                            var modifier = utils_1.UA.mac || utils_1.UA.ipad ? 3 : -2; //Spacing is different on OSX, iPad
                            txt.size = Math.max(txt.value.length + modifier, 1);
                        };
                        keys.forEach(function (fileName) {
                            var file = files[fileName];
                            var active = fileName === _this.props.activeFileName ||
                                (_this.props.activeFileName == null && fileName.toLowerCase() === "main.cs");
                            Tabs.push((React.createElement("div", {className: active ? 'active' : null, onClick: function (e) { return !active ? _this.props.selectFileName(fileName) : _this.props.editFileName(fileName); }}, _this.props.editingFileName !== fileName
                                ? React.createElement("b", null, fileName)
                                : React.createElement("input", {type: "text", className: "txtFileName", onBlur: function (e) { return _this.props.onRenameFile(fileName, e); }, onKeyDown: function (e) { return e.keyCode === 13 ? e.target.blur() : null; }, defaultValue: fileName, onKeyUp: sizeToFit_1, size: Math.max(fileName.length - 3, 1), autoFocus: true}))));
                            FileList.push((React.createElement("div", {className: "file", onClick: function (e) { return _this.props.selectFileName(fileName); }}, fileName)));
                            if (active) {
                                source = file.content;
                                options["mode"] = fileName.endsWith('.config')
                                    ? "application/xml"
                                    : "text/x-csharp";
                            }
                        });
                        if (this.props.isOwner) {
                            Tabs.push((React.createElement("div", {title: "Add new file", onClick: function (e) { return _this.props.editFileName("+"); }, className: this.props.editingFileName === "+" ? "active" : "", style: { padding: "4px 6px" }}, this.props.editingFileName !== "+"
                                ? React.createElement("i", {className: "material-icons", style: { fontSize: 13 }}, "add")
                                : React.createElement("input", {type: "text", className: "txtFileName", onBlur: function (e) { return _this.props.onCreateFile(e); }, onKeyDown: function (e) { return e.keyCode === 13 ? e.target.blur() : null; }, onKeyUp: sizeToFit_1, size: "1", autoFocus: true}))));
                        }
                    }
                    return (React.createElement("div", {id: "editor"}, React.createElement("div", {id: "tabs", style: { display: this.props.files ? 'flex' : 'none' }}, FileList.length > 0
                        ? React.createElement("i", {id: "files-menu", className: "material-icons", onClick: function (e) { return _this.props.showPopup(e, _this.filesPopup); }}, "arrow_drop_down") : null, Tabs), React.createElement("div", {id: "popup-files", className: "popup", ref: function (e) { return _this.filesPopup = e; }}, FileList), React.createElement(react_codemirror_1.default, {value: source, options: options, onChange: function (src) { return _this.props.updateSource(_this.props.activeFileName, src); }})));
                };
                return Editor;
            }(React.Component));
            exports_1("default", Editor);
        }
    }
});
//# sourceMappingURL=Editor.js.map