/// <reference path='../typings/index.d.ts'/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { Provider, connect } from 'react-redux';
import { reduxify, getSortedFileNames } from './utils';
import { store, StateKey, GistCacheKey, IGistMeta, IGistFile } from './state';
import { queryString, JsonServiceClient, ServerEventsClient, ISseConnect, splitOnLast, humanize, dateFmt, timeFmt12 } from './servicestack-client';
import { JsonViewer } from './json-viewer';

import CodeMirror from 'react-codemirror';
import "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js";
import "./codemirror.js";

import {
    RunScript,
    GetScriptVariables, VariableInfo,
    CancelScript,
    EvaluateExpression,
    ScriptExecutionResult, ScriptStatus,
    StoreGist, GithubFile
} from './Gistlyn.dtos';

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
        }
    }
};

const ScriptStatusRunning = ["Started", "PrepareToRun", "Running"];
const ScriptStatusError = ["Cancelled", "CompiledWithErrors", "ThrowedException"];

const GistTemplates = {
    NewGist: "4fab2fa13aade23c81cabe83314c3cd0",
    NewPrivateGist: "7eaa8f65869fa6682913e3517bec0f7e",
    HomeCollection: "2cc6b5db6afd3ccb0d0149e55fdb3a6a",
    Gists: ["4fab2fa13aade23c81cabe83314c3cd0", "7eaa8f65869fa6682913e3517bec0f7e", "2cc6b5db6afd3ccb0d0149e55fdb3a6a"]
};

ReactGA.initialize("UA-80898009-1");

var client = new JsonServiceClient("/");
var sse = new ServerEventsClient("/", ["gist"], {
    handlers: {
        onConnect(activeSub: ISseConnect) {
            store.dispatch({ type: 'SSE_CONNECT', activeSub });
            ReactGA.set({ userId: activeSub.userId });
        },
        ConsoleMessage(m, e) {
            store.dispatch({ type: 'CONSOLE_LOG', logs: [{ msg: m.message }] });
        },
        ScriptExecutionResult(m: ScriptExecutionResult, e) {
            if (m.status === store.getState().scriptStatus) return;

            const cls = ScriptStatusError.indexOf(m.status) >= 0 ? "error" : "";
            store.dispatch({ type: 'CONSOLE_LOG', logs: [{ msg: humanize(m.status), cls }] });
            store.dispatch({ type: 'SCRIPT_STATUS', scriptStatus: m.status });

            if (m.status === "CompiledWithErrors" && m.errors) {
                const errorMsgs = m.errors.map(e => ({ msg: e.info, cls: "error" }));
                store.dispatch({ type: 'CONSOLE_LOG', logs: errorMsgs });
            }
            else if (m.status === "Completed") {
                var request = new GetScriptVariables();
                request.scriptId = store.getState().activeSub.id;
                client.get(request)
                    .then(r => {
                        store.dispatch({ type: "VARS_LOAD", variables: r.variables });
                    });
            }
        }
    }
});

@reduxify(
    (state) => ({
        gist: state.gist,
        hasLoaded: state.hasLoaded,
        activeSub: state.activeSub,
        meta: state.meta,
        files: state.files,
        activeFileName: state.activeFileName,
        editingFileName: state.editingFileName,
        logs: state.logs,
        variables: state.variables,
        inspectedVariables: state.inspectedVariables,
        expression: state.expression,
        expressionResult: state.expressionResult,
        error: state.error,
        scriptStatus: state.scriptStatus,
        dialog: state.dialog,
        dirty: state.dirty,
        gistStats: state.gistStats,
        collection: state.collection,
        showCollection: state.showCollection
    }),
    (dispatch) => ({
        changeGist: (gist: string, options = {}) => dispatch({ type: 'GIST_CHANGE', gist, options }),
        updateSource: (fileName: string, content: string) => dispatch({ type: 'SOURCE_CHANGE', fileName, content }),
        selectFileName: (activeFileName: string) => dispatch({ type: 'FILE_SELECT', activeFileName }),
        editFileName: (fileName: string) => dispatch({ type: 'FILENAME_EDIT', fileName }),
        raiseError: (error: string) => dispatch({ type: 'ERROR_RAISE', error }),
        clearError: () => dispatch({ type: 'ERROR_CLEAR' }),
        clearConsole: () => dispatch({ type: 'CONSOLE_CLEAR' }),
        logConsole: (logs: any[]) => dispatch({ type: 'CONSOLE_LOG', logs }),
        logConsoleError: (status: any) => dispatch({ type: 'CONSOLE_LOG', logs: [Object.assign({ msg: status.message, cls: "error" }, status)] }),
        logConsoleMsgs: (txtMessages: any[]) => dispatch({ type: 'CONSOLE_LOG', logs: txtMessages.map(msg => ({ msg })) }),
        setScriptStatus: (scriptStatus: ScriptStatus) => dispatch({ type: 'SCRIPT_STATUS', scriptStatus }),
        inspectVariable: (name: string, variables: any) => dispatch({ type: 'VARS_INSPECT', name, variables }),
        setExpression: (expression: string) => dispatch({ type: 'EXPRESSION_SET', expression }),
        setExpressionResult: (expressionResult: any) => dispatch({ type: 'EXPRESSION_LOAD', expressionResult }),
        showDialog: (dialog: string) => dispatch({ type: 'DIALOG_SHOW', dialog }),
        setDirty: (dirty: boolean) => dispatch({ type: 'DIRTY_SET', dirty }),
        changeCollection: (id: string, showCollection: boolean) => dispatch({ type: 'COLLECTION_CHANGE', collection: { id }, showCollection })
    })
)
class App extends React.Component<any, any> {

    getFile(fileName: string): any {
        if (this.props.files == null)
            return null;
        for (let k in this.props.files) {
            if (k.toLowerCase() === fileName) {
                return this.props.files[k];
            }
        }
        return null;
    }

    getFileContents(fileName: string): string {
        const file = this.getFile(fileName);
        return file != null
            ? file.content
            : null;
    }

    getMainFile() {
        return this.getFile("main.cs");
    }

    get scriptId(): string {
        return this.props.activeSub && this.props.activeSub.id;
    }

    run = () => {
        this.props.clearError();
        var request = new RunScript();
        request.scriptId = this.scriptId;
        request.mainSource = this.getMainFile().content;
        request.packagesConfig = this.getFileContents("packages.config");
        request.sources = [];
        for (var k in this.props.files || []) {
            if (k.endsWith(".cs") && k.toLowerCase() !== "main.cs")
                request.sources.push(this.props.files[k].content);
        }

        this.props.setScriptStatus("Started");

        ReactGA.event({ category: 'gist', action: 'Run Gist', label: this.props.gist });

        client.post(request)
            .then(r => {
                this.props.logConsoleMsgs(r.references.map(ref => `loaded ${ref.name}`));
            })
            .catch(r => {
                this.props.raiseError(r.responseStatus);
                this.props.setScriptStatus("Failed");
            });
    }

    cancel = () => {
        this.props.clearError();
        const request = new CancelScript();
        request.scriptId = this.scriptId;

        ReactGA.event({ category: 'gist', action: 'Cancel Gist', label: this.props.gist });

        client.post(request)
            .then(r => {
                this.props.setScriptStatus("Cancelled");
                this.props.logConsole([{ msg: "Cancelled by user", cls: "error" }]);
            })
            .catch(r => {
                this.props.raiseError(r.responseStatus);
                this.props.setScriptStatus("Failed");
            });
    }

    handleGistUpdate(e: React.FormEvent) {
        const target = e.target as HTMLInputElement;
        const parts = splitOnLast(target.value, '/');
        const hash = parts[parts.length - 1];
        this.props.changeGist(hash);
    }

    updateSource(src: string) {
        this.props.updateSource(this.props.activeFileName, src);
    }

    inspectVariable(v: VariableInfo) {
        const request = new GetScriptVariables();
        request.scriptId = this.scriptId;
        request.variableName = v.name;

        ReactGA.event({ category: 'preview', action: 'Inspect Variable', label: this.props.gist + ": " + v.name });

        client.get(request)
            .then(r => {
                if (r.status !== "Completed") {
                    const msg = r.status === "Unknown"
                        ? "Script no longer exists on server"
                        : `Script Error: ${humanize(r.status)}`;
                    this.props.logConsole([{ msg, cls: "error" }]);
                } else {
                    this.props.inspectVariable(v.name, r.variables);
                }
            });
    }

    getVariableRows(v: VariableInfo) {
        var varProps = this.props.inspectedVariables[v.name] as VariableInfo[];
        var rows = [(
            <tr>
                <td className="name" style={{ whiteSpace: "nowrap" }}>
                    {v.isBrowseable
                        ? (varProps
                            ? <span className="octicon octicon-triangle-down" style={{ margin: "0 10px 0 0" }} onClick={e => this.props.inspectVariable(v.name, null) }></span>
                            : <span className="octicon octicon-triangle-right" style={{ margin: "0 10px 0 0" }} onClick={e => this.inspectVariable(v) }></span>)
                        : <span className="octicon octicon-triangle-right" style={{ margin: "0 10px 0 0", color: "#f7f7f7" }}></span>}
                    <a onClick={e => this.setAndEvaluateExpression(v.name) }>{v.name}</a>
                </td>
                <td className="value">{v.value}</td>
                <td className="type">{v.type}</td>
            </tr>
        )];

        if (varProps) {
            varProps.forEach(p => {
                rows.push((
                    <tr>
                        <td className="name" style={{ padding: "0 0 0 50px" }}>
                            {p.canInspect
                                ? <a onClick={e => this.setAndEvaluateExpression(v.name + (p.name[0] != "[" ? "." : "") + p.name) }>{p.name}</a>
                                : <span style={{ color: "#999" }}>{p.name}</span>}
                        </td>
                        <td className="value">{p.value}</td>
                        <td className="type">{p.type}</td>
                    </tr>
                ));
            });
        }

        return rows;
    }

    setAndEvaluateExpression(expr: string) {
        this.props.setExpression(expr);
        this.evaluateExpression(expr);
    }

    evaluateExpression(expr: string) {
        if (!expr) {
            this.props.setExpression(expr);
            return;
        }

        const request = new EvaluateExpression();
        request.scriptId = this.scriptId;
        request.expression = expr;
        request.includeJson = true;

        ReactGA.event({ category: 'preview', action: 'Evaluate Expression', label: this.props.gist + ": " + expr.substring(0, 50) });

        client.post(request)
            .then(r => {
                if (r.result.errors && r.result.errors.length > 0) {
                    r.result.errors.forEach(x => {
                        this.props.logConsole({ msg: x.info, cls: "error" });
                    });
                } else {
                    this.props.setExpressionResult(r.result);
                }
            })
            .catch(e => {
                this.props.logConsoleError(e.responseStatus || e); //both have schema `{ message }`
            });
    }

    revertGist(clearAll: boolean = false) {
        localStorage.removeItem(GistCacheKey(this.props.gist));
        if (clearAll) {
            localStorage.removeItem(StateKey);
        }

        ReactGA.event({ category: 'gist', action: 'Revert Gist', label: this.props.gist });

        this.props.changeGist(this.props.gist, { reload: true });
    }

    createStoreGist(opt: any = {}): StoreGist {
        const meta = this.props.meta as IGistMeta;
        const files = this.props.files as { [index: string]: IGistFile };
        if (!meta || !files) return null;

        var fileContents = {};
        Object.keys(files).forEach(fileName => {
            const file = new GithubFile();
            file.filename = fileName;
            file.content = files[fileName].content;
            fileContents[fileName] = file;
        });

        const request = new StoreGist();
        request.gist = this.props.gist;
        request.fork = opt.fork || this.shouldFork();
        request.ownerLogin = opt.ownerLogin || meta.owner_login;
        request.public = opt.public || meta.public;
        request.description = opt.description || meta.description;
        request.files = opt.files || fileContents;
        return request;
    }

    saveGist(opt: any = {}) {
        if (this.dialog)
            this.dialog.classList.add("disabled");

        const request = this.createStoreGist(opt);
        if (request == null)
            return;

        const done = () => this.dialog && this.dialog.classList.remove("disabled");

        ReactGA.event({ category: 'gist', action: 'Save Gist', label: this.props.gist });

        client.post(request)
            .then(r => {
                if (this.props.gist !== r.gist) {
                    this.props.changeGist(r.gist);
                }
                this.props.logConsole([{ msg: `[${timeFmt12()}] Gist was saved.`, cls: "success" }]);
                this.props.setDirty(false);
                done();
            })
            .catch(e => {
                this.props.logConsoleError(e.responseStatus || e);
                done();
            });
    }

    handleCreateFile(e: React.SyntheticEvent) {
        var txt = e.target as HTMLInputElement;
        if (txt == null)
            return;

        txt.disabled = true;
        this.createFile(txt.value)
            .then(r => txt.disabled = false);
    }

    createFile(fileName: string) {
        const done = () => this.props.editFileName(null);

        const request = this.createStoreGist();
        if (!fileName || fileName.trim().length == 0 || request == null) {
            done();
            return Promise.resolve(null);
        }

        if (fileName.indexOf('.') === -1)
            fileName += ".cs";

        request.files[fileName] = new GithubFile();
        request.files[fileName].content = `// ${fileName}\n// Created by ${this.props.activeSub.displayName} on ${dateFmt()}\n\n`; //Gist API requires non Whitespace content

        ReactGA.event({ category: 'file', action: 'Create File', label: fileName });

        return client.post(request)
            .then(r => {
                this.props.changeGist(r.gist, { reload: true, activeFileName: fileName });
            })
            .catch(e => {
                this.props.logConsoleError(e.responseStatus || e);
            });
    }

    handleRenameFile(oldFileName: string, e: React.SyntheticEvent) {
        var txt = e.target as HTMLInputElement;
        if (txt == null)
            return;

        txt.disabled = true;
        this.renameFile(oldFileName, txt.value)
            .then(r => txt.disabled = false);
    }

    renameFile(oldFileName: string, newFileName: string) {
        const done = () => this.props.editFileName(null);

        const request = this.createStoreGist();
        if (!newFileName || newFileName.trim().length == 0 || request == null || newFileName === oldFileName) {
            done();
            return Promise.resolve(null);
        }
        else if (oldFileName === "main.cs" || oldFileName === "packages.config") {
            done();
            this.props.logConsoleError({ message: "Cannot rename " + oldFileName });
            return Promise.resolve(null);
        }

        if (newFileName.indexOf('.') === -1)
            newFileName += ".cs";

        request.files[oldFileName].filename = newFileName;

        ReactGA.event({ category: 'file', action: 'Rename File', label: newFileName });

        return client.post(request)
            .then(r => {
                this.props.changeGist(r.gist, { reload: true, activeFileName: newFileName });
            })
            .catch(e => {
                this.props.logConsoleError(e.responseStatus || e);
            });
    }

    deleteFile(fileName: string) {
        if (!fileName) return;

        var json = JSON.stringify({ files: { [fileName]: null } });

        ReactGA.event({ category: 'file', action: 'Delete File', label: fileName });

        fetch("/proxy/gists/" + this.props.gist, {
            method: "PATCH",
            credentials: "include",
            body: json
        })
            .then((res) => {
                this.props.changeGist(this.props.gist, { reload: true });
            })
            .catch(e => {
                this.props.logConsoleError(e.responseStatus || e);
            });
    }

    saveGistAs() {
        ReactGA.event({ category: 'gist', action: 'Save As', label: this.props.gist });

        this.props.showDialog("save-as");
    }

    signIn() {
        ReactGA.event({ category: 'user', action: 'Sign In', label: this.props.gist });

        location.href = '/auth/github';
    }

    consoleScroll: HTMLDivElement;
    filesPopup: HTMLDivElement;
    morePopup: HTMLDivElement;
    userPopup: HTMLDivElement;
    lastPopup: HTMLDivElement;
    txtGist: HTMLInputElement;
    txtDescription: HTMLInputElement;
    dialog: HTMLDivElement;

    componentDidUpdate() {
        if (!this.consoleScroll) return;
        this.consoleScroll.scrollTop = this.consoleScroll.scrollHeight;
        window.onkeydown = this.handleWindowKeyDown.bind(this);
    }

    showPopup(e: React.MouseEvent, el: HTMLDivElement) {
        if (el === this.lastPopup) return;

        ReactGA.event({ category: 'app', action: 'Show Popup', label: el.id });

        e.stopPropagation();
        this.lastPopup = el;
        el.style.display = "block";
    }

    handleBodyClick(e: React.MouseEvent) {
        if (this.lastPopup != null) {
            this.lastPopup.style.display = "none";
            this.lastPopup = null;
        }
    }

    handleWindowKeyDown(e: KeyboardEvent) {
        const target = e.target as Element;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

        if (e.ctrlKey && (e.keyCode === 37 || e.keyCode === 39)) { //ctrl + left/right
            if (!this.props.files || this.props.files.length === 0) return;
            e.stopPropagation();
            const keys = getSortedFileNames(this.props.files);
            const activeIndex = Math.max(0, keys.indexOf(this.props.activeFileName));
            let nextFileIndex = activeIndex + (e.keyCode === 37 ? -1 : 1);
            nextFileIndex = nextFileIndex < 0
                ? keys.length - 1
                : nextFileIndex % keys.length;
            this.props.selectFileName(keys[nextFileIndex]);
        }
    }

    getAuthUsername() {
        var activeSub = this.props.activeSub as ISseConnect;
        return activeSub && parseInt(activeSub.userId) > 0 ? activeSub.displayName : null;
    }

    shouldFork() {
        var authUsername = this.getAuthUsername();
        var meta = this.props.meta as IGistMeta;
        return authUsername != null
            && meta != null
            && meta.public
            && authUsername != meta.owner_login
            && GistTemplates.Gists.indexOf(this.props.gist) === -1;
    }

    render() {

        let source = "";
        const Tabs = [];
        const FileList = [];
        const MorePopup = [];
        var activeSub = this.props.activeSub as ISseConnect;
        var authUsername = this.getAuthUsername();
        const meta = this.props.meta as IGistMeta;
        const shouldFork = this.shouldFork();
        const files = this.props.files as { [index: string]: IGistFile };
        let description = meta != null ? meta.description : null;

        if (files != null) {
            var keys = getSortedFileNames(files);

            const sizeToFit = (e: React.KeyboardEvent) => {
                var txt = e.target as HTMLInputElement;
                txt.size = Math.max(txt.value.length - 3, 1);
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
                                onBlur={e => this.handleRenameFile(fileName, e) }
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

            if (authUsername && meta && meta.owner_login === authUsername) {
                Tabs.push((
                    <div title="Add new file" onClick={e => this.props.editFileName("+") }
                        className={this.props.editingFileName === "+" ? "active" : ""}
                        style={{ padding: "4px 6px" }}>
                        {this.props.editingFileName !== "+"
                            ? <i className="material-icons" style={{ fontSize: 13 }}>add</i>
                            : <input type="text"className="txtFileName"
                                onBlur={e => this.handleCreateFile(e) }
                                onKeyDown={e => e.keyCode === 13 ? (e.target as HTMLElement).blur() : null }
                                onKeyUp={sizeToFit} size="1" autoFocus /> }
                    </div>
                ));
            }
        }

        const main = this.getMainFile();
        if (this.props.hasLoaded && this.props.gist && this.props.files && main == null && this.props.error == null) {
            this.props.error = { message: "main.cs is missing" };
        }

        const isScriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;

        var Preview = [];

        const showCollection = this.props.showCollection && this.props.collection && this.props.collection.html != null;
        if (showCollection) {

            var LiveLists = null;
            if (this.props.collection.id === GistTemplates.HomeCollection) {
                const allGists = Object.keys(this.props.gistStats)
                    .map(k => this.props.gistStats[k])
                    .filter(x => GistTemplates.Gists.indexOf(x.id) === -1);
                const sortByRecent = gists => {
                    gists.sort((a, b) => b.date - a.date);
                    return gists;
                };
                var recentGists = sortByRecent(allGists.filter(x => !x.collection));
                var recentCollections = sortByRecent(allGists.filter(x => x.collection));
                var myGists = recentGists.filter(x => x.owner_login === authUsername);

                if (recentGists.length > 0 || recentCollections.length > 0) {
                    LiveLists = (
                        <div  style={{ float: "right", margin: "0px -8px 0px 0px", padding: "0 0 5px 10px" }}>
                            <div id="livelist" style={{ boxShadow: "1px 2px 3px rgba(0, 0, 0, 0.3)" }}>
                                {recentCollections.length > 0
                                    ? (<div>
                                        <h3>Recent Collections</h3>
                                        { recentCollections.slice(0, 10).map(x => <a href={`?collection=${x.id}`}>{x.description}</a>) }
                                    </div>)
                                    : null}

                                {recentGists.length > 0
                                    ? (<div>
                                        <h3>Recent Gists</h3>
                                        { recentGists.slice(0, 10).map(x => <a href={`?gist=${x.id}`}>{x.description}</a>) }
                                    </div>)
                                    : null}

                                {myGists.length > 0
                                    ? (<div>
                                        <h3>My Gists</h3>
                                        { myGists.slice(0, 30).map(x => <a href={`?gist=${x.id}`}>{x.description}</a>) }
                                    </div>)
                                    : null}
                            </div>
                        </div>);
                }
            }

            Preview.push((
                <div id="collection" className="section"
                    onClick={e => {
                        var a = e.target as HTMLAnchorElement;
                        if (a && a.href) {
                            const qs = queryString(a.href);
                            if (qs["gist"] || qs["collection"]) {
                                e.preventDefault();
                                if (qs["gist"])
                                    this.props.changeGist(qs["gist"]);
                                else if (qs["collection"])
                                    this.props.changeCollection(qs["collection"], true);
                            }
                        }
                    }}>
                    <table style={{ width: "100%" }}>
                        <thead>
                            <tr><th>{this.props.collection.description || "Collections"}</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    {LiveLists}
                                    <div id="markdown"
                                        dangerouslySetInnerHTML={{ __html: this.props.collection.html }} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>));

        } else if (this.props.error != null) {
            var code = this.props.error.errorCode ? `(${this.props.error.errorCode}) ` : "";
            Preview.push((
                <div id="errors" className="section">
                    <div style={{ margin: "25px 25px 40px 25px", color: "#a94442" }}>
                        {code}{this.props.error.message}
                    </div>
                    { this.props.error.stackTrace != null
                        ? <pre style={{ color: "red", padding: "5px 30px" }}>{this.props.error.stackTrace}</pre>
                        : null}
                </div>));
        } else if (isScriptRunning) {
            Preview.push((
                <div id="status" className="section">
                    <div style={{ margin: '40px', color: "#444", width: "215px" }} title="executing...">
                        <img src="/img/ajax-loader.gif" style={{ float: "right", margin: "5px 0 0 0" }} />
                        <i className="material-icons" style={{ position: "absolute" }}>build</i>
                        <p style={{ padding: "0 0 0 30px", fontSize: "22px" }}>Executing Script</p>
                        <div id="splash" style={{ padding: 30 }}>
                            <img src="/img/compiling.png" />
                        </div>
                    </div>
                </div>));
        }
        else if (this.props.variables.length > 0) {
            var vars = this.props.variables as VariableInfo[];
            var exprResult = this.props.expressionResult as ScriptExecutionResult;
            var exprVar = exprResult != null && exprResult.variables.length > 0 ? exprResult.variables[0] : null;
            Preview.push((
                <div id="vars" className="section">
                    <table style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th className="name">name</th>
                                <th className="value">value</th>
                                <th className="type">type </th>
                            </tr>
                        </thead>
                        <tbody>
                            {vars.map(v => this.getVariableRows(v)) }
                            <tr>
                                <td id="evaluate" colSpan={3}>
                                    <input type="text" placeholder="Evaluate Expression" value={this.props.expression}
                                        onChange={e => this.props.setExpression((e.target as HTMLInputElement).value) }
                                        onKeyPress={e => e.which === 13 ? this.evaluateExpression(this.props.expression) : null }
                                        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
                                    <i className="material-icons" title="run" onClick={e => this.evaluateExpression(this.props.expression) }>play_arrow</i>
                                    {exprVar
                                        ? (
                                            <div id="expression-result">
                                                <JsonViewer json={exprVar.json} />
                                            </div>
                                        )
                                        : null}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>));
        } else {
            Preview.push(<div id="placeholder"></div>);
        }

        if (this.props.logs.length > 0 && !this.props.showCollection) {
            Preview.push((
                <div id="console" className="section" style={{ borderTop: "solid 1px #ddd", borderBottom: "solid 1px #ddd", font: "14px/20px arial", height: "350px" }}>
                    <b style={{ background: "#444", color: "#fff", padding: "1px 8px", position: "absolute", right: "3px", margin: "-22px 0" }}>console</b>
                    <i className="material-icons clear-btn" title="clear console" onClick={e => this.props.clearConsole() }>clear</i>
                    <div className="scroll" style={{ overflow: "auto", maxHeight: "350px" }} ref={(el) => this.consoleScroll = el}>
                        <table style={{ width: "100%" }}>
                            <tbody style={{ font: "13px/18px monospace", color: "#444" }}>
                                {this.props.logs.map(log => (
                                    <tr>
                                        <td style={{ padding: "2px 8px", tabSize: 4 }}><pre className={log.cls}>{log.msg}</pre></td>
                                    </tr>
                                )) }
                            </tbody>
                        </table>
                    </div>
                </div>));
        }

        var Dialog = null;
        if (this.props.dialog != null && meta != null) {
            if (this.props.dialog === "save-as") {
                const isPublic = meta.public;
                if (this.txtDescription) {
                    description = this.txtDescription.value;
                } else {
                    setTimeout(() => this.txtDescription.select(), 0);
                }
                Dialog = (
                    <div id="dialog" onClick={e => this.props.showDialog(null) } onKeyDown={e => e.keyCode === 27 ? this.props.showDialog(null) : null }>
                        <div className="dialog" ref={e => this.dialog = e } onClick={e => e.stopPropagation() }>
                            <div className="dialog-header">
                                <i className="material-icons close" onClick={e => this.props.showDialog(null) }>close</i>
                                {shouldFork ? "Fork" : "Save"} Gist
                            </div>
                            <div className="dialog-body">
                                <div className="row">
                                    <label htmlFor="txtDescription">Description</label>
                                    <input ref={e => this.txtDescription = e} type="text" id="txtDescription"
                                        defaultValue={ description }
                                        onKeyUp={e => this.forceUpdate() }
                                        onKeyDown={e => e.keyCode == 13 && description ? this.saveGist({ description }) : null }
                                        autoFocus />
                                </div>
                                <div className="row" style={{ color: isPublic ? "#4CAF50" : "#9C27B0" }} title={ "This gist is " + (isPublic ? "public" : "private") }>
                                    <label></label>
                                    <i className="material-icons" style={{ verticalAlign: "bottom", marginRight: 5, fontSize: 20 }}>check</i>
                                    Is {isPublic ? "public" : "private"}
                                </div>
                            </div>
                            <div className="dialog-footer">
                                <img className="loading" src="/img/ajax-loader.gif" style={{ margin: "5px 10px 0 0" }} />
                                <span className={"btn" + (description ? "" : " disabled") }
                                    onClick={e => description ? this.saveGist({ description }) : null }>
                                    Create {shouldFork ? "Fork" : "Gist"}
                                </span>
                            </div>
                        </div>
                    </div>);
            }
        }

        MorePopup.push((
            <div onClick={e => this.props.changeGist(GistTemplates.NewGist) }>New Gist</div>));
        MorePopup.push((
            <div onClick={e => this.props.changeGist(GistTemplates.NewPrivateGist) }>New Private Gist</div>));

        const toggleEdit = () => {
            const inputWasHidden = this.txtGist.style.display !== "inline-block";
            const showInput = !meta || !description || inputWasHidden;
            this.txtGist.style.display = showInput ? "inline-block" : "none";
            document.getElementById("desc-overlay").style.display = showInput ? "none" : "inline-block";

            if (inputWasHidden) {
                this.txtGist.focus();
                this.txtGist.select();
            }
        };

        const showGistInput = !meta || !description || (this.txtGist && this.txtGist == document.activeElement);

        return (
            <div id="body" onClick={e => this.handleBodyClick(e) }>
                <div className="titlebar">
                    <div className="container">
                        <a href="https://servicestack.net" title="servicestack.net" target="_blank"><img id="logo" src="img/logo-32-inverted.png" /></a>
                        <h3>Gistlyn</h3> <sup style={{ padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}>BETA</sup>
                        <div id="gist">
                            { meta
                                ? <img src={ meta.owner_avatar_url } title={meta.owner_login} style={{ verticalAlign: "bottom", margin: "0 5px 2px 0" }} />
                                : <span className="octicon octicon-logo-gist" style={{ verticalAlign: "bottom", margin: "0 6px 6px 0" }}></span> }

                            <input ref={e => this.txtGist = e} type="text" id="txtGist" placeholder="gist hash or url"
                                style={{ display: showGistInput ? "inline-block" : "none" }} onBlur={toggleEdit}
                                value={this.props.gist}
                                onFocus={e => (e.target as HTMLInputElement).select() }
                                onChange={e => this.handleGistUpdate(e) } />

                            <div id="desc-overlay" style={{ display: showGistInput ? "none" : "inline-block" }}  onClick={toggleEdit}>
                                <div className="inner">
                                    <h2>
                                        {description}
                                    </h2>

                                    { meta && !meta.public
                                        ? (<span style={{ position: "absolute", margin: "3px 0px 3px -40px", fontSize: 12, background: "#ffefc6", color: "#888", padding: "2px 4px", borderRadius: 3 }}
                                            title="This gist is private">secret</span>)
                                        : null }

                                    <i className="material-icons">close</i>
                                </div>
                            </div>

                            { main != null
                                ? <i className="material-icons" style={{ color: "#0f9", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}>check</i>
                                : this.props.error
                                    ? <i className="material-icons" style={{ color: "#CE93D8", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}>error</i>
                                    : null }

                            <i id="btnCollections"
                                onClick={e => this.props.changeCollection((this.props.collection && this.props.collection.id) || GistTemplates.HomeCollection, !showCollection) }
                                className={"material-icons" + (showCollection ? " active" : "") }>apps</i>

                        </div>
                        { !authUsername
                            ? (
                                <div id="sign-in" style={{ position: "absolute", right: 5 }}>
                                    <a href="/auth/github" style={{ color: "#fff", textDecoration: "none" }}>
                                        <span style={{ whiteSpace: "nowrap", fontSize: 14 }}>sign-in</span>
                                        <span style={{ verticalAlign: "sub", margin: "0 0 0 10px" }} className="mega-octicon octicon-mark-github" title="Sign in with GitHub"></span>
                                    </a>
                                </div>
                            )
                            : ([
                                <div id="signed-in" style={{ position: "absolute", right: 5, cursor: "pointer" }} onClick={e => this.showPopup(e, this.userPopup) }>
                                    <span style={{ whiteSpace: "nowrap", fontSize: 14 }}>{activeSub.displayName}</span>
                                    <img src={activeSub.profileUrl} style={{ verticalAlign: "middle", marginLeft: 5, borderRadius: "50%" }} />
                                </div>,
                                <div id="popup-user" className="popup" ref={e => this.userPopup = e } style={{ position: "absolute", top: 42, right: 0 }}>
                                    <div onClick={e => location.href = "/auth/logout" }>Sign out</div>
                                </div>
                            ]) }
                    </div>
                </div>

                <div id="content">
                    <div id="ide">
                        <div id="editor">
                            <div id="tabs" style={{ display: this.props.files ? 'flex' : 'none' }}>
                                {FileList.length > 0
                                    ? <i id="files-menu" className="material-icons" onClick={e => this.showPopup(e, this.filesPopup) }>arrow_drop_down</i> : null }
                                {Tabs}
                            </div>
                            <div id="popup-files" className="popup" ref={e => this.filesPopup = e }>
                                {FileList}
                            </div>
                            <CodeMirror value={source} options={options} onChange={src => this.updateSource(src) } />
                        </div>
                        <div id="preview">
                            {Preview}
                        </div>
                    </div>
                </div>

                <div id="footer-spacer"></div>

                <div id="footer">
                    <div id="actions" style={{ visibility: main ? "visible" : "hidden" }} className="noselect">
                        <div id="revert" onClick={e => this.revertGist(e.shiftKey) }>
                            <i className="material-icons">undo</i>
                            <p>Revert Changes</p>
                        </div>
                        { meta && meta.owner_login == authUsername
                            ? (<div id="save" onClick={e => this.saveGist({}) } className={this.props.dirty ? "" : "disabled"}>
                                <i className="material-icons">save</i>
                                <p>Save Gist</p>
                            </div>)
                            : (<div id="saveas" onClick={e => authUsername ? this.saveGistAs() : this.signIn() }
                                title={!authUsername ? "Sign-in to save gists" : "Save a copy in your Github gists"}>
                                <span className="octicon octicon-repo-forked" style={{ margin: "3px 3px 0 0" }}></span>
                                <p>{authUsername ? (shouldFork ? "Fork As" : "Save As") : "Sign-in to save"}</p>
                            </div>) }
                        { meta && meta.owner_login === authUsername && this.props.activeFileName && this.props.activeFileName !== "main.cs" && this.props.activeFileName !== "packages.config"
                            ? (<div id="delete-file" onClick={e => confirm(`Are you sure you want to delete '${this.props.activeFileName}?`) ? this.deleteFile(this.props.activeFileName) : null }>
                                <i className="material-icons">delete </i>
                                <p>Delete File</p>
                            </div>)
                            : null }
                    </div>
                    <div id="more-menu" style={{ position: "absolute", right: 5, bottom: 5, color: "#fff", cursor: "pointer" }}>
                        <i className="material-icons" onClick={e => this.showPopup(e, this.morePopup) }>more_vert</i>
                    </div>
                    <div id="popup-more" className="popup" ref={e => this.morePopup = e } style={{ position: "absolute", bottom: 42, right: 0 }}>
                        {MorePopup}
                    </div>
                </div>

                <div id="run" className={main == null ? "disabled" : ""} onClick={e => !isScriptRunning ? this.run() : this.cancel() }>
                    {main != null
                        ? (!isScriptRunning
                            ? <i className="material-icons" title="run">play_circle_outline</i>
                            : <i className="material-icons" title="cancel script" style={{ color: "#FF5252" }}>cancel</i>)
                        : <i className="material-icons" title="disabled">play_circle_outline</i>}
                </div>
                {Dialog}
            </div>
        );
    }
}

var stateJson = localStorage.getItem(StateKey);
var state = null;
if (stateJson) {
    try {
        state = JSON.parse(stateJson);
        store.dispatch({ type: 'LOAD', state });

        if (state.gist != null && !(state.files || state.meta)) {
            store.dispatch({ type: 'GIST_CHANGE', gist: state.gist });
        }

    } catch (e) {
        console.log('ERROR loading state:', e, stateJson);
        localStorage.removeItem(StateKey);
    }
}

const qs = queryString(location.href);
var qsGist = qs["gist"] || GistTemplates.NewGist;
if (qsGist != (state && state.gist)) {
    store.dispatch({ type: 'GIST_CHANGE', gist: qsGist });
}

const qsCollection = qs["collection"];
if (qsCollection) {
    store.dispatch({
        type: 'COLLECTION_CHANGE',
        collection: { id: qsCollection },
        showCollection: (state && state.showCollection) || qsCollection != (state && state.collection && state.collection.id)
    });
} else if (!state) {
    store.dispatch({ type: 'COLLECTION_CHANGE', collection: { id: GistTemplates.HomeCollection }, showCollection: true });
}

window.onpopstate = e => {
    if (!(e.state && e.state.id)) return;
    store.dispatch({ type: 'GIST_CHANGE', gist: e.state.id });
};

/* Example gists:
5b0435641091841a5eacff44946a22c0
3f7cd9cbe863747a904bba10ce34ee8f
efc71477cee60916ef71d839084d1afd
6831799881c92434f80e141c8a2699eb
*/


ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById("app"));
