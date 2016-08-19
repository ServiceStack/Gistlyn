import * as React from 'react';
import { queryString, splitOnLast } from 'servicestack-client';
import { UA, getSortedFileNames, IGistFile } from './utils';

import CodeMirror from 'react-codemirror';
import "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/markdown/markdown.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/gfm/gfm.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/javascript/javascript.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/css/css.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/htmlmixed/htmlmixed.js";
import "./codemirror.js";

const extMimeTypes = {
    "cs": "text/x-csharp",
    "xml": "application/xml",
    "config": "application/xml",
    "md": "text/x-markdown",
    "css": "text/css",
    "js": "text/javascript",
    "json": "application/json"
};

export default class Editor extends React.Component<any, any> {
    filesPopup: HTMLDivElement;
    codeMirror: CodeMirror.Editor;

    resetSafariHeight() {
        if (UA.safari) { //Safari doesn't respect height:100%
            const el = document.getElementsByClassName("CodeMirror-scroll")[0] as HTMLElement;
            if (el) {
                const editorSection = document.getElementById("editor");
                const reactEditor = document.getElementsByClassName("ReactCodeMirror")[0] as HTMLElement;
                if (!editorSection || !reactEditor) return;
                el.style.height = (editorSection.clientHeight - (reactEditor.offsetTop - editorSection.offsetTop)) + "px"
            }
        }
    }

    componentDidMount() {
        this.resetSafariHeight();
    }

    getDoc() {
        return this.codeMirror && this.codeMirror.getDoc();
    }

    getSelection() : string {
        const doc = this.getDoc();
        return doc 
            ? doc.getSelection()
            : "";
    }

    replaceSelection(text:string, opt:any={}) {
        const doc = this.getDoc();
        if (!doc) return;

        const str = text.replace("{selection}", doc.getSelection());
        if (doc.getSelection() === "") {
            const cursor = doc.getCursor();
            doc.replaceRange(str, cursor, cursor);
            if (opt.noselect && (opt.noselect.line != null || opt.noselect.ch != null)) {
                doc.setCursor({line: cursor.line + (opt.noselect.line || 0), ch: cursor.ch + (opt.noselect.ch || 0) });
            }
        } else {
            doc.replaceSelection(str);
        }
        this.codeMirror.focus();
    }

    toggleLine(text:string) {
        const doc = this.getDoc();
        if (!doc) return;

        const cursor = doc.getCursor();
        const line = doc.getRange({line:cursor.line,ch:0}, {line:cursor.line+1, ch:0});
        if (line.startsWith(text)) {
            doc.replaceRange("", {line:cursor.line,ch:0}, {line:cursor.line,ch:text.length});
        } else {
            doc.replaceRange(text, {line:cursor.line,ch:0}, {line:cursor.line,ch:0});
        }
        this.codeMirror.focus();
    }

    handleCodeFormat() {
        const doc = this.getDoc();
        const selection = this.getSelection();
        if (selection === "") {
            var cursor = doc.getCursor();
            doc.replaceRange("\n```\n\n```\n", cursor, cursor);
            doc.setCursor({line: cursor.line + 2, ch: cursor.ch});
            this.codeMirror.focus();
        } else {
            this.replaceSelection("`{selection}`");
        }
    }

    render() {
        var options = {
            lineNumbers: true,
            matchBrackets: true,
            indentUnit: 4,
            mode: "text/x-csharp",
            extraKeys: {
                "F11"(cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Esc"(cm) {
                    if (cm.getOption("fullScreen"))
                        cm.setOption("fullScreen", false);
                    this.props.onShortcut("Esc")
                },
                "Ctrl-Enter": cm => this.props.onShortcut("Ctrl-Enter"),
                "Ctrl-S": cm => this.props.onShortcut("Ctrl-S"),
                "Alt-S": cm => this.props.onShortcut("Alt-S"),
                "Alt-C": cm => this.props.onShortcut("Alt-C"),
                "Ctrl-B": cm => this.replaceSelection("**{selection}**", { noselect: { ch: 2 }}),
                "Ctrl-I": cm => this.replaceSelection("_{selection}_", { noselect: { ch: 1 }}),
            }
        };

        let source = "";
        const files = this.props.files as { [index: string]: IGistFile };
        const Tabs = [];
        const FileList = [];

        setTimeout(() => this.resetSafariHeight(), 0);

        if (files) {
            var keys = getSortedFileNames(files);

            const sizeToFit = (e: React.KeyboardEvent) => {
                var txt = e.target as HTMLInputElement;
                var modifier = UA.mac || UA.ipad ? 3 : -2; //Spacing is different on OSX, iPad
                txt.size = Math.max(txt.value.length + modifier, 1);
            };

            keys.forEach(fileName => {
                const file = files[fileName];
                const active = fileName === this.props.activeFileName ||
                    (this.props.activeFileName == null && fileName.toLowerCase() === "main.cs");

                Tabs.push((
                    <div className={active ? 'active' : null}
                        onClick={e => !active ? this.props.selectFileName(fileName) : this.props.editFileName(fileName) }>
                        {this.props.editingFileName !== fileName
                            ? <b>{fileName}</b>
                            : <input type="text" className="txtFileName"
                                onBlur={e => this.props.onRenameFile(fileName, e) }
                                onKeyDown={e => e.keyCode === 13 ? (e.target as HTMLElement).blur() : null }
                                defaultValue={fileName}
                                onKeyUp={sizeToFit} size={Math.max(fileName.length - 3, 1) }
                                autoFocus /> }
                    </div>
                ));

                FileList.push((
                    <div className="file" onClick={e => this.props.selectFileName(fileName) }>
                        {fileName}
                    </div>
                ));

                if (active) {
                    var ext = splitOnLast(fileName, ".")[1];
                    source = file.content;
                    options["mode"] = extMimeTypes[ext] || "text/x-csharp";
                }
            });

            if (this.props.isOwner) {
                Tabs.push((
                    <div title="Add new file" onClick={e => this.props.editFileName("+") }
                        className={this.props.editingFileName === "+" ? "active" : ""}
                        style={{ padding: "4px 6px" }}>
                        {this.props.editingFileName !== "+"
                            ? <i className="material-icons" style={{ fontSize: 13 }}>add</i>
                            : <input type="text"className="txtFileName"
                                onBlur={e => this.props.onCreateFile(e) }
                                onKeyDown={e => e.keyCode === 13 ? (e.target as HTMLElement).blur() : null }
                                onKeyUp={sizeToFit} size="1" autoFocus /> }
                    </div>
                ));
            }
        }

        return (
            <div id="editor" className={this.props.isOwner ? "owner" : ""}
                onDragOver={e => {
                    console.log('editor onDragOver');
                    e.stopPropagation();
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                } }
                onDrop={e => console.log('editor onDrop') }
                onDragStart={e => console.log('editor onDragStart') }
                onDragEnter={e => console.log('editor onDragEnter') }
                >
                <div id="tabs" style={{ display: this.props.files ? 'flex' : 'none' }}>
                    {FileList.length > 0
                        ? <i id="files-menu" className="material-icons" onClick={e => this.props.showPopup(e, this.filesPopup) }>arrow_drop_down</i> : null }
                    {Tabs}
                </div>
                <div id="popup-files" className="popup" ref={e => this.filesPopup = e }>
                    {FileList}
                </div>

                {options["mode"] == "text/x-markdown" 
                    ? (<div id="markdown-toolbar">
                           <i className="material-icons" title="Heading" onClick={e => this.toggleLine("## ")}>format_size</i>
                           <i className="material-icons" title="Bold" onClick={e => this.replaceSelection("**{selection}**", { noselect: { ch: 2 }}) }>format_bold</i>
                           <i className="material-icons" title="Italics" onClick={e => this.replaceSelection("_{selection}_", { noselect: { ch: 1 }}) }>format_italic</i>
                           <i className="material-icons" title="Strikethrough" onClick={e => this.replaceSelection("~~{selection}~~", { noselect: { ch: 2 }})}>strikethrough_s</i>
                           <i className="material-icons" title="Quote Text" onClick={e => this.toggleLine("> ")}>format_quote</i>
                           <i className="material-icons" title="Unordered List" onClick={e => this.toggleLine(" - ")}>format_list_bulleted</i>
                           <i className="material-icons" title="Ordered List" onClick={e => this.toggleLine(" 1. ")}>format_list_numbered</i>
                           <i className="material-icons" title="Code" onClick={e => this.handleCodeFormat()}>code</i>
                           <i className="material-icons" title="Insert Link" onClick={e => this.props.showDialog("insert-link")}>insert_link</i>
                           <i className="material-icons" title="Insert Image" onClick={e => this.props.showDialog("img-upload")}>insert_photo</i>
                       </div>)
                    : null}

                <CodeMirror ref={e => this.codeMirror = e && e.getCodeMirror()} value={source} options={options} onChange={src => this.props.updateSource(this.props.activeFileName, src) } />
            </div>);
    }
}