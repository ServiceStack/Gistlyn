System.register(['react', 'servicestack-client', './utils', 'react-codemirror', "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js", "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js", "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js", "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js", "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js", "jspm_packages/npm/codemirror@5.16.0/mode/markdown/markdown.js", "jspm_packages/npm/codemirror@5.16.0/mode/gfm/gfm.js", "jspm_packages/npm/codemirror@5.16.0/mode/javascript/javascript.js", "jspm_packages/npm/codemirror@5.16.0/mode/css/css.js", "jspm_packages/npm/codemirror@5.16.0/mode/htmlmixed/htmlmixed.js", "./codemirror.js"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, servicestack_client_1, utils_1, react_codemirror_1;
    var extMimeTypes, Editor;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
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
            function (_6) {},
            function (_7) {},
            function (_8) {},
            function (_9) {},
            function (_10) {},
            function (_11) {}],
        execute: function() {
            extMimeTypes = {
                "cs": "text/x-csharp",
                "xml": "application/xml",
                "config": "application/xml",
                "md": "text/x-markdown",
                "css": "text/css",
                "js": "text/javascript",
                "json": "application/json"
            };
            Editor = (function (_super) {
                __extends(Editor, _super);
                function Editor() {
                    _super.apply(this, arguments);
                }
                Editor.prototype.resetSafariHeight = function () {
                    if (utils_1.UA.safari) {
                        var el = document.getElementsByClassName("CodeMirror-scroll")[0];
                        if (el) {
                            var editorSection = document.getElementById("editor");
                            var reactEditor = document.getElementsByClassName("ReactCodeMirror")[0];
                            if (!editorSection || !reactEditor)
                                return;
                            el.style.height = (editorSection.clientHeight - (reactEditor.offsetTop - editorSection.offsetTop)) + "px";
                        }
                    }
                };
                Editor.prototype.componentDidMount = function () {
                    this.resetSafariHeight();
                };
                Editor.prototype.getDoc = function () {
                    return this.codeMirror && this.codeMirror.getDoc();
                };
                Editor.prototype.getSelection = function () {
                    var doc = this.getDoc();
                    return doc
                        ? doc.getSelection()
                        : "";
                };
                Editor.prototype.replaceSelection = function (text, opt) {
                    if (opt === void 0) { opt = {}; }
                    var doc = this.getDoc();
                    if (!doc)
                        return;
                    var str = text.replace("{selection}", doc.getSelection());
                    if (doc.getSelection() === "") {
                        var cursor = doc.getCursor();
                        doc.replaceRange(str, cursor, cursor);
                        if (opt.noselect && (opt.noselect.line != null || opt.noselect.ch != null)) {
                            doc.setCursor({ line: cursor.line + (opt.noselect.line || 0), ch: cursor.ch + (opt.noselect.ch || 0) });
                        }
                    }
                    else {
                        doc.replaceSelection(str);
                    }
                    this.codeMirror.focus();
                };
                Editor.prototype.toggleLine = function (text) {
                    var doc = this.getDoc();
                    if (!doc)
                        return;
                    var cursor = doc.getCursor();
                    var line = doc.getRange({ line: cursor.line, ch: 0 }, { line: cursor.line + 1, ch: 0 });
                    if (line.startsWith(text)) {
                        doc.replaceRange("", { line: cursor.line, ch: 0 }, { line: cursor.line, ch: text.length });
                    }
                    else {
                        doc.replaceRange(text, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: 0 });
                    }
                    this.codeMirror.focus();
                };
                Editor.prototype.handleCodeFormat = function () {
                    var doc = this.getDoc();
                    var selection = this.getSelection();
                    if (selection === "") {
                        var cursor = doc.getCursor();
                        doc.replaceRange("\n```\n\n```\n", cursor, cursor);
                        doc.setCursor({ line: cursor.line + 2, ch: cursor.ch });
                        this.codeMirror.focus();
                    }
                    else {
                        this.replaceSelection("`{selection}`");
                    }
                };
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
                            "Alt-C": function (cm) { return _this.props.onShortcut("Alt-C"); },
                            "Ctrl-B": function (cm) { return _this.replaceSelection("**{selection}**", { noselect: { ch: 2 } }); },
                            "Ctrl-I": function (cm) { return _this.replaceSelection("_{selection}_", { noselect: { ch: 1 } }); },
                        }
                    };
                    var source = "";
                    var files = this.props.files;
                    var Tabs = [];
                    var FileList = [];
                    setTimeout(function () { return _this.resetSafariHeight(); }, 0);
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
                                var ext = servicestack_client_1.splitOnLast(fileName, ".")[1];
                                source = file.content;
                                options["mode"] = extMimeTypes[ext] || "text/x-csharp";
                            }
                        });
                        if (this.props.isOwner) {
                            Tabs.push((React.createElement("div", {title: "Add new file", onClick: function (e) { return _this.props.editFileName("+"); }, className: this.props.editingFileName === "+" ? "active" : "", style: { padding: "4px 6px" }}, this.props.editingFileName !== "+"
                                ? React.createElement("i", {className: "material-icons", style: { fontSize: 13 }}, "add")
                                : React.createElement("input", {type: "text", className: "txtFileName", onBlur: function (e) { return _this.props.onCreateFile(e); }, onKeyDown: function (e) { return e.keyCode === 13 ? e.target.blur() : null; }, onKeyUp: sizeToFit_1, size: "1", autoFocus: true}))));
                        }
                    }
                    return (React.createElement("div", {id: "editor", className: this.props.isOwner ? "owner" : "", onDragOver: function (e) {
                        console.log('editor onDragOver');
                        e.stopPropagation();
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                    }, onDrop: function (e) { return console.log('editor onDrop'); }, onDragStart: function (e) { return console.log('editor onDragStart'); }, onDragEnter: function (e) { return console.log('editor onDragEnter'); }}, React.createElement("div", {id: "tabs", style: { display: this.props.files ? 'flex' : 'none' }}, FileList.length > 0
                        ? React.createElement("i", {id: "files-menu", className: "material-icons", onClick: function (e) { return _this.props.showPopup(e, _this.filesPopup); }}, "arrow_drop_down") : null, Tabs), React.createElement("div", {id: "popup-files", className: "popup", ref: function (e) { return _this.filesPopup = e; }}, FileList), options["mode"] == "text/x-markdown"
                        ? (React.createElement("div", {id: "markdown-toolbar"}, React.createElement("i", {className: "material-icons", title: "Heading", onClick: function (e) { return _this.toggleLine("## "); }}, "format_size"), React.createElement("i", {className: "material-icons", title: "Bold", onClick: function (e) { return _this.replaceSelection("**{selection}**", { noselect: { ch: 2 } }); }}, "format_bold"), React.createElement("i", {className: "material-icons", title: "Italics", onClick: function (e) { return _this.replaceSelection("_{selection}_", { noselect: { ch: 1 } }); }}, "format_italic"), React.createElement("i", {className: "material-icons", title: "Strikethrough", onClick: function (e) { return _this.replaceSelection("~~{selection}~~", { noselect: { ch: 2 } }); }}, "strikethrough_s"), React.createElement("i", {className: "material-icons", title: "Quote Text", onClick: function (e) { return _this.toggleLine("> "); }}, "format_quote"), React.createElement("i", {className: "material-icons", title: "Unordered List", onClick: function (e) { return _this.toggleLine(" - "); }}, "format_list_bulleted"), React.createElement("i", {className: "material-icons", title: "Ordered List", onClick: function (e) { return _this.toggleLine(" 1. "); }}, "format_list_numbered"), React.createElement("i", {className: "material-icons", title: "Code", onClick: function (e) { return _this.handleCodeFormat(); }}, "code"), React.createElement("i", {className: "material-icons", title: "Insert Link", onClick: function (e) { return _this.props.showDialog("insert-link"); }}, "insert_link"), React.createElement("i", {className: "material-icons", title: "Insert Image", onClick: function (e) { return _this.props.showDialog("img-upload"); }}, "insert_photo")))
                        : null, React.createElement(react_codemirror_1.default, {ref: function (e) { return _this.codeMirror = e && e.getCodeMirror(); }, value: source, options: options, onChange: function (src) { return _this.props.updateSource(_this.props.activeFileName, src); }})));
                };
                return Editor;
            }(React.Component));
            exports_1("default", Editor);
        }
    }
});
//# sourceMappingURL=Editor.js.map