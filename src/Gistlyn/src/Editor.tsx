import * as React from 'react';
import { queryString } from 'servicestack-client';
import { UA, getSortedFileNames, IGistFile } from './utils';

import CodeMirror from 'react-codemirror';
import "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js";
import "./codemirror.js";

export default class Editor extends React.Component<any, any> {
    filesPopup: HTMLDivElement;

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
                },
                "Ctrl-Enter": (cm) => {
                    this.props.onRun();
                },
                "Ctrl-S": (cm) => {
                    this.props.onSave();
                }
            }
        };

        let source = "";
        const files = this.props.files as { [index: string]: IGistFile };
        const Tabs = [];
        const FileList = [];

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
                    source = file.content;
                    options["mode"] = fileName.endsWith('.config')
                        ? "application/xml"
                        : "text/x-csharp";
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
            <div id="editor">
                <div id="tabs" style={{ display: this.props.files ? 'flex' : 'none' }}>
                    {FileList.length > 0
                        ? <i id="files-menu" className="material-icons" onClick={e => this.props.showPopup(e, this.filesPopup) }>arrow_drop_down</i> : null }
                    {Tabs}
                </div>
                <div id="popup-files" className="popup" ref={e => this.filesPopup = e }>
                    {FileList}
                </div>
                <CodeMirror value={source} options={options} onChange={src => this.props.updateSource(this.props.activeFileName, src) } />
            </div>);
    }
}