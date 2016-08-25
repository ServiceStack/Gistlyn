/// <reference path='../typings/index.d.ts'/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { Provider, connect } from 'react-redux';
import { store } from './state';
import { JsonViewer } from './json-viewer';

import { 
    queryString, JsonServiceClient, ServerEventsClient, ISseConnect, 
    splitOnFirst, splitOnLast, humanize, dateFmt, timeFmt12 
} from 'servicestack-client';

import { 
    client, reduxify, UA, getSortedFileNames, Config, StateKey, 
    GistCacheKey, GistTemplates, FileNames, IGistMeta, IGistFile, toGithubFiles, 
    addClientPackages, BatchItems 
} from './utils';

import SaveAsDialog from './SaveAsDialog';
import EditGistDialog from './EditGistDialog';
import ShortcutsDialog from './ShortcutsDialog';
import InsertLinkDialog from './InsertLinkDialog';
import ImageUploadDialog from './ImageUploadDialog';
import TakeSnapshotDialog from './TakeSnapshotDialog';
import ConsoleViewerDialog from './ConsoleViewerDialog';
import InadequateBrowserDialog from './InadequateBrowserDialog';
import AddServiceStackReferenceDialog from './AddServiceStackReferenceDialog';
import Console from './Console';
import Collections from './Collections';
import Editor from './Editor';

import {
    RunScript,
    GetScriptVariables, VariableInfo,
    CancelScript,
    EvaluateExpression,
    ScriptExecutionResult, ScriptStatus,
    StoreGist, GithubFile
} from './Gistlyn.dtos';

const ScriptStatusRunning = ["Started", "PrepareToRun", "Running"];
const ScriptStatusError = ["Cancelled", "CompiledWithErrors", "ThrowedException"];
var capturedSnapshot = null;

ReactGA.initialize("UA-80898009-1");

if (UA.nosse) {
    ReactGA.event({ category: 'error', action: 'load', label: "nosse" });

    ReactDOM.render(
        <InadequateBrowserDialog />,
        document.getElementById("app"));

    throw "This browser does not support Server Sent Events";
}

const statusToError = status => ({ errorCode: status.errorCode, msg: status.message, cls: "error" });

const batchLogs = new BatchItems(30, logs => store.dispatch({ type: 'CONSOLE_LOG', logs }));

const channels = ["gist"];
const sse = new ServerEventsClient("/", channels, {
    handlers: {
        onConnect(activeSub: ISseConnect) {
            store.dispatch({ type: 'SSE_CONNECT', activeSub });
            ReactGA.set({ userId: activeSub.userId });
            fetch("/session-to-token", { method:"POST", credentials:"include" });
        },
        ConsoleMessage(m, e) {
            batchLogs.queue({ msg: m.message });
        },
        ScriptExecutionResult(m: ScriptExecutionResult, e) {
            if (m.status === store.getState().scriptStatus) return;

            if (ScriptStatusError.indexOf(m.status) >= 0 && m.errorResponseStatus) {
                batchLogs.queue(statusToError(m.errorResponseStatus));
            } else {
                batchLogs.queue({ msg: humanize(m.status) });
            }

            store.dispatch({ type: 'SCRIPT_STATUS', scriptStatus: m.status });

            if (m.status === "CompiledWithErrors" && m.errors) {
                const errorMsgs = m.errors.map(e => ({ msg: e.info, cls: "error" }));
                errorMsgs.forEach(m =>  batchLogs.queue(m));
            } else if (m.status === "Completed") {
                const request = new GetScriptVariables();
                const state = store.getState();
                request.scriptId = state.activeSub.id;
                client.get(request)
                    .then(r => {
                        store.dispatch({ type: "VARS_LOAD", variables: r.variables });
                    });

                if (state.expression) {
                    evalExpression(state.gist, state.activeSub.id, state.expression);
                }
            }
        }
    }
});

function evalExpression(gist: string, scriptId: string, expr: string) {
    if (!expr)
        return;

    const request = new EvaluateExpression();
    request.scriptId = scriptId;
    request.expression = expr;
    request.includeJson = true;

    ReactGA.event({ category: 'preview', action: 'Evaluate Expression', label: gist + ": " + expr.substring(0, 50) });

    client.post(request)
        .then(r => {
            if (r.result.errors && r.result.errors.length > 0) {
                r.result.errors.forEach(x => {
                    store.dispatch({ type: 'CONSOLE_LOG', logs: [{ msg: x.info, cls: "error" }] });
                });
            } else {
                store.dispatch({ type: 'EXPRESSION_LOAD', expressionResult: r.result });
            }
        })
        .catch(e => {
            var status = e.responseStatus || e; //both have schema `{ message }`
            store.dispatch({ type: 'CONSOLE_LOG', logs: [statusToError(status)] });
        });
};

@reduxify(
    (state) => ({
        url: state.url,
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
        reset: () => dispatch({ type:'RESET' }),
        urlChanged: (url: string) => dispatch({ type:'URL_CHANGE', url }),
        changeGist: (gist: string, options = {}) => dispatch({ type: 'GIST_CHANGE', gist, options }),
        updateDescription: (description: string) => dispatch({ type: 'META_UPDATE', description }),
        updateSource: (fileName: string, content: string) => dispatch({ type: 'SOURCE_CHANGE', fileName, content }),
        addFile: (fileName: string, content: string) => dispatch({ type: 'FILE_ADD', fileName, file: { fileName, content } }),
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
        showDialog: (dialog: string) => dispatch({ type: 'DIALOG_SHOW', dialog }),
        setDirty: (dirty: boolean) => dispatch({ type: 'DIRTY_SET', dirty }),
        changeCollection: (id: string, showCollection: boolean) => dispatch({ type: 'COLLECTION_CHANGE', collection: { id }, showCollection }),
        removeGistStat: (gist: string) => dispatch({ type: "GISTSTAT_REMOVE", gist })
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
        return this.getFile(FileNames.GistMain);
    }

    get scriptId(): string {
        return this.props.activeSub && this.props.activeSub.id;
    }

    save() {
        const meta = this.props.meta;
        const authUsername = this.getAuthUsername();
        if (!meta) {
            this.props.logConsoleError({ message: "There is nothing to save." });
        } else if (!authUsername) {
            this.signIn();
        } else if (meta.owner_login !== authUsername) {
            this.saveGistAs();
        } else {
            this.saveGist();
        }
    }

    run = () => {
        const main = this.getMainFile();
        if (!main) return;

        this.props.clearError();
        var request = new RunScript();
        request.scriptId = this.scriptId;
        request.mainSource = main.content;
        request.packagesConfig = this.getFileContents(FileNames.GistPackages);
        request.sources = [];
        for (var k in this.props.files || []) {
            if (k.endsWith(".cs") && k.toLowerCase() !== FileNames.GistMain)
                request.sources.push(this.props.files[k].content);
        }

        this.props.setScriptStatus("Started");

        ReactGA.event({ category: 'gist', action: 'Run Gist', label: this.props.gist });

        client.post(request)
            .then(r => {
                var msgs = r.references.map(ref => `loaded ${ref.name}`);
                msgs.push("\n");
                this.props.logConsoleMsgs(msgs);
            })
            .catch(e => {
                this.props.raiseError(e.responseStatus || e);
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
                <td className="value"><span title={v.value}>{v.value}</span></td>
                <td className="type"><span title={v.type}>{v.type}</span></td>
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
                        <td className="value"><span title={p.value}>{p.value}</span></td>
                        <td className="type"><span title={p.type}>{p.type}</span></td>
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
        } else {
            evalExpression(this.props.gist, this.scriptId, expr);
        }
    }

    clearGistCache() {
        var removeKeys = [];
        for (var i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("/v1/gists/")) {
                removeKeys.push(key);
            }
        }
        removeKeys.forEach(key => localStorage.removeItem(key));
    }

    revertGist(shiftKey: boolean = false, ctrlKey:boolean = false) {
        localStorage.removeItem(GistCacheKey(this.props.gist));

        ReactGA.event({ category: 'gist', action: 'Revert Gist', label: this.props.gist });

        var gist = this.props.gist;
        const resetAll = shiftKey && ctrlKey;
        if (resetAll) {
            localStorage.clear();
            history.replaceState(null, "Gistlyn", "/");
            gist = GistTemplates.NewGist;
            this.props.reset();
        } else if (shiftKey) {
            localStorage.removeItem(StateKey);
        }

        this.props.changeGist(gist, { reload: true });
    }

    createStoreGist(opt: any = {}): StoreGist {
        const meta = this.props.meta as IGistMeta;
        const files = this.props.files as { [index: string]: IGistFile };
        if (!meta || !files) return null;

        const request = new StoreGist();
        request.gist = this.props.gist;
        request.fork = opt.fork || this.shouldFork();
        request.ownerLogin = opt.ownerLogin || meta.owner_login;
        request.public = opt.public || meta.public;
        request.description = opt.description || meta.description;
        request.files = opt.files || toGithubFiles(files);
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

        const complete = r => {
            if (this.props.gist !== r.gist) {
                this.props.changeGist(r.gist);
            }
            else {
                this.props.updateDescription(document.title = request.description);
            }
            this.props.showDialog(null);
            this.props.setDirty(false);
            this.props.logConsole([{ msg: `[${timeFmt12()}] Gist was saved.`, cls: "success" }]);
            done();
        };

        client.post(request)
            .then(complete)
            .catch(e => {
                this.props.logConsoleError(e.responseStatus || e);
                if (e.responseStatus && (e.responseStatus.message || "").indexOf("404") >= 0) { //Was deleted outside Gistlyn
                    request.ownerLogin = null;
                    this.props.logConsole([{ msg: `[${timeFmt12()}] Gist no longer exists. Attempting to Save as new Gist...` }]);
                    client.post(request)
                        .then(complete)
                        .catch(retryError => {
                            this.props.logConsoleError(retryError.responseStatus || retryError);
                            done();
                        });
                } else {
                    done();
                }
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

    createFile(fileName: string, opt:any = {}) {
        const done = () => this.props.editFileName(null);

        const request = this.createStoreGist();
        if (!fileName || fileName.trim().length == 0 || request == null) {
            done();
            return Promise.resolve(null);
        }

        if (fileName.indexOf('.') === -1)
            fileName += ".cs";

        request.files[fileName] = new GithubFile();
        request.files[fileName].content = opt.content || `// ${fileName}\n// Created by ${this.props.activeSub.displayName} on ${dateFmt()}\n\n`; //Gist API requires non Whitespace content

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
        else if (oldFileName === FileNames.GistMain || oldFileName === FileNames.GistPackages) {
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

        fetch("/github-proxy/gists/" + this.props.gist, { method: "PATCH", credentials: "include", body: json })
            .then((res) => {
                this.props.changeGist(this.props.gist, { reload: true });
            })
            .catch(e => {
                this.props.logConsoleError(e.responseStatus || e);
            });
    }

    deleteGist(gist: string) {
        if (!gist) return;

        ReactGA.event({ category: 'gist', action: 'Delete Gist', label: gist });

        fetch("/github-proxy/gists/" + this.props.gist, { method: "DELETE", credentials: "include" })
            .then((res) => {
                this.props.removeGistStat(gist);
                this.props.changeGist(GistTemplates.NewGist, { reload: true });
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

    editor: Editor;
    morePopup: HTMLDivElement;
    editorPopup: HTMLDivElement;
    userPopup: HTMLDivElement;
    lastPopup: HTMLDivElement;
    txtUrl: HTMLInputElement;
    txtDescription: HTMLInputElement;
    dialog: HTMLDivElement;

    componentDidUpdate() {
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

        if (e.ctrlKey) {
            if (e.keyCode === 37 || e.keyCode === 39) { //ctrl + left/right
                if (!this.props.files || this.props.files.length === 0) return;
                e.stopPropagation();
                const keys = getSortedFileNames(this.props.files);
                const activeIndex = Math.max(0, keys.indexOf(this.props.activeFileName));
                let nextFileIndex = activeIndex + (e.keyCode === 37 ? -1 : 1);
                nextFileIndex = nextFileIndex < 0
                    ? keys.length - 1
                    : nextFileIndex % keys.length;
                this.props.selectFileName(keys[nextFileIndex]);
            } else if (e.keyCode == 13) {
                this.onShortcut("Ctrl-Enter");
            } else if (e.key && ["s"].indexOf(e.key) >= 0) {
                e.preventDefault();
                this.onShortcut("Ctrl-" + e.key.toUpperCase());
            }
        }
        else if (e.altKey && ["s", "c"].indexOf(e.key) >= 0) {
            e.preventDefault();
            this.onShortcut("Alt-" + e.key.toUpperCase());
        }

        if (e.key === "?") {
            this.props.showDialog("shortcuts");
        }
        else if (e.keyCode == 27) {
            this.onShortcut("Esc");
        }
    }

    onShortcut(pattern: string) {
        switch (pattern) {
            case "Esc":
                this.props.showDialog(null);
                break;
            case "Ctrl-Enter":
                const scriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;
                if (!scriptRunning)
                    this.run();
                else
                    this.cancel();
                break;
            case "Ctrl-S":
                this.save();
                break;
            case "Alt-S":
                capturedSnapshot = store.getState();
                this.props.showDialog("take-snapshot");
                break;
            case "Alt-C":
                capturedSnapshot = store.getState();
                this.props.showDialog("console-viewer");
                break;
        }
    }

    handleAddReference(baseUrl, fileName, content, requestDto, autorun) {
        var main = this.getMainFile();
        if (!main) return;

        if (main.content.indexOf("{BaseUrl}") >= 0) { //Add ServiceStack Reference Gist
            var updated = main.content.replace("{BaseUrl}", baseUrl)
                .replace("{Domain}", splitOnFirst(baseUrl.split("://")[1], "/")[0])
                .replace("RequestDto", requestDto);
            this.props.updateSource(FileNames.GistMain, updated);
        }

        var packagesConfig = this.getFileContents(FileNames.GistPackages);
        if (packagesConfig) {
            this.props.updateSource(FileNames.GistPackages, addClientPackages(packagesConfig));
        }

        this.props.addFile(fileName, content);
        if (autorun) {
            this.props.selectFileName(FileNames.GistMain); // Show what's running
            setTimeout(() => this.run(), 0);
        }

        this.props.showDialog(null);
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

        const MorePopup = [];
        const EditorPopup = [];
        var activeSub = this.props.activeSub as ISseConnect;
        var authUsername = this.getAuthUsername();
        const meta = this.props.meta as IGistMeta;
        const shouldFork = this.shouldFork();
        const files = this.props.files as { [index: string]: IGistFile };
        let description = meta != null ? meta.description : null;

        const main = this.getMainFile();
        const collection = this.props.collection;
        const isGistCollection = this.getFile(FileNames.CollectionIndex) != null;
        const isScript = main != null;
        const isScriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;
        const isGistOwner = authUsername && meta && meta.owner_login === authUsername;
        const isCollectionOwner = authUsername && collection && collection.owner_login === authUsername;

        var Preview = [];

        const showCollection = this.props.showCollection && collection && collection.html != null;
        if (showCollection) {
            Preview.push(<Collections collection={collection} isOwner={isCollectionOwner}
                gistStats={this.props.gistStats} excludeGists={GistTemplates.Gists}
                showLiveLists={collection.id === GistTemplates.HomeCollection} authUsername={authUsername}
                onHome={e => this.props.urlChanged(GistTemplates.HomeCollection) }
                changeGist={(id, options) => this.props.changeGist(id, options) }
                changeCollection={(id, reload) => this.props.changeCollection(id, reload) }
                viewSnapshot={(id) => this.props.urlChanged(id)} />
            );
        } else if (this.props.showCollection) { //Still loading
            Preview.push((
                <div id="collection" className="section">
                    <div id="collection-header">
                        Collection
                    </div>
                    <div id="collection-body">
                        <div id="markdown">
                            <div style={{ color:"#444", fontSize:20, position: "absolute", top:"50%", margin:"-55px 0 0 0", textAlign:"center", width:"100%" }}>
                                <img src="/img/ajax-loader.gif" style={{ margin: "5px 10px 0 0" }} />
                                loading...
                            </div>
                        </div>
                    </div>
                </div>
            ));
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

                    <span className="lnk" style={{ paddingLeft: 25 }} onClick={e => this.props.urlChanged(GistTemplates.HomeCollection)}>Home</span>
                </div>));
        } else if (isScriptRunning) {
            Preview.push((
                <div id="status" className="section">
                    <div style={{ margin: '40px', color: "#444", width: "215px" }} title="executing...">
                        <img src="/img/ajax-loader.gif" style={{ float: "right", margin: "5px 0 0 0" }} />
                        <i className="material-icons" style={{ position: "absolute" }}>build</i>
                        <p style={{ padding: "0 0 0 30px", fontSize: "22px" }}>Executing Script</p>
                        <div id="splash" style={{ padding: "20px 0 0 0" }}>
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
                <div id="vars" className="section" style={{ display:"flex", flexFlow:"column", overflow:"hidden" }}>
                    <table style={{ width: "100%", flex:1 }}>
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
                                <td colSpan={3}>
                                    <input id="txtEval" type="text" placeholder="Evaluate Expression" value={this.props.expression}
                                        onChange={e => this.props.setExpression((e.target as HTMLInputElement).value) }
                                        onKeyPress={e => e.which === 13 ? this.evaluateExpression(this.props.expression) : null }
                                        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
                                    <i id="btnEval" className="material-icons noselect" title="run" onClick={e => this.evaluateExpression(this.props.expression) }>play_arrow</i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div id="evaluate" style={{ overflow: "auto" }}>
                        {exprVar
                            ? (
                                <div id="expression-result">
                                    <JsonViewer json={exprVar.json} />
                                </div>
                            )
                            : null}
                    </div>

                </div>));
        } else {
            Preview.push(<div id="placeholder"></div>);
        }

        if (this.props.logs.length > 0 && !this.props.showCollection) {
            Preview.push(<Console logs={this.props.logs} onClear={() => this.props.clearConsole() } showDialog={this.props.showDialog} />);
        }

        MorePopup.push((
            <div onClick={e => this.props.urlChanged(GistTemplates.HomeCollection) }>Home</div>));
        MorePopup.push((
            <div onClick={e => this.props.changeGist(GistTemplates.NewGist) }>New Gist</div>));
        MorePopup.push((
            <div onClick={e => this.props.changeGist(GistTemplates.NewPrivateGist) }>New Private Gist</div>));
        MorePopup.push((
            <div onClick={e => this.props.changeGist(GistTemplates.NewCollection) }>New Collection</div>));
        MorePopup.push((
            <div onClick={e => this.props.showDialog("shortcuts") }>Shortcuts</div>));
        MorePopup.push((
            <div onClick={e => this.clearGistCache() }>Clear Gist Caches</div>));
        MorePopup.push((
            <div onClick={e => window.open("https://github.com/ServiceStack/Gistlyn/issues") }>Send Feedback</div>));

        EditorPopup.push((
            <div><a href={"https://gist.github.com/" + this.props.gist} target="_blank">View on Github</a></div>));
        if (authUsername) {
            EditorPopup.push((
                <div onClick={e => this.props.showDialog("edit-gist") }>Edit Gist</div>));
            EditorPopup.push((
                <div onClick={e => confirm(`Are you sure you want to delete this gist?`) ? this.deleteGist(this.props.gist) : null }>Delete Gist</div>));
        }
        EditorPopup.push((
            <div onClick={e => this.props.showDialog("add-ss-ref") }>Add ServiceStack Reference</div>));

        const toggleEdit = () => {
            const inputWasHidden = this.txtUrl.style.display !== "inline-block";
            const showInput = !meta || !description || inputWasHidden;
            this.txtUrl.style.display = showInput ? "inline-block" : "none";
            document.getElementById("desc-overlay").style.display = showInput ? "none" : "inline-block";

            if (inputWasHidden) {
                this.txtUrl.focus();
                this.txtUrl.select();
            }
        };

        const showGistInput = !meta || !description || (this.txtUrl && this.txtUrl == document.activeElement);
        const goHome = () => this.props.urlChanged(GistTemplates.HomeCollection);

        return (
            <div id="body" onClick={e => this.handleBodyClick(e) } className={UA.getClassList()}>
                <div className="titlebar">
                    <div className="container">
                        <img id="logo" src="img/logo-32-inverted.png" alt="ServiceStack logo" onClick={goHome} style={{ cursor: "pointer" }} />
                        <h3 title="Home" onClick={goHome} style={{ cursor:"pointer" }}>Gistlyn</h3> <sup style={{ padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}>BETA</sup>
                        <div id="gist">
                            { meta
                                ? <img src={ meta.owner_avatar_url } title={meta.owner_login} style={{ verticalAlign: "bottom", margin: "0 5px 2px 0" }} />
                                : <span className="octicon octicon-logo-gist" style={{ verticalAlign: "bottom", margin: "0 6px 6px 0" }}></span> }

                            <input ref={e => this.txtUrl = e} type="text" id="txtUrl" placeholder="gist hash or url"
                                style={{ display: showGistInput ? "inline-block" : "none" }} onBlur={toggleEdit}
                                value={this.props.url} onFocus={e => (e.target as HTMLInputElement).select()}
                                onChange={e => this.props.urlChanged((e.target as HTMLInputElement).value) }
                                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />

                            <div id="desc-overlay" style={{ display: showGistInput ? "none" : "inline-block" }}  onClick={toggleEdit}>
                                <div className="inner">
                                    <h2>
                                        {description}
                                    </h2>

                                    { meta && !meta.public
                                        ? (<span style={{ margin: "3px 0px 3px -40px", fontSize: 12, background: "#ffefc6", color: "#888", padding: "2px 4px", borderRadius: 3 }}
                                            title="This gist is private">secret</span>)
                                        : null }

                                    <i className="material-icons">close</i>
                                </div>
                            </div>

                            { this.props.error
                                ? <i className="material-icons" style={{ color: "#FF5252", fontSize: 26, position: "absolute", margin: "2px 0 0 7px", background:"#f1f1f1", borderRadius:14 }}>error</i>
                                : main != null
                                    ? <i className="material-icons" style={{ color: "#0f9", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}>check</i>
                                    : null }

                            <i id="btnCollections" style={{ visibility: meta ? "visible" : "hidden" }} title="Collections"
                                onClick={e => this.props.changeCollection((collection && collection.id) || GistTemplates.HomeCollection, !showCollection) }
                                className={"material-icons" + (showCollection ? " active" : "") }>apps</i>

                        </div>
                        { !authUsername
                            ? (<div id="sign-in" style={{ position: "absolute", right: 5, top:4 }}>
                                   <a href="/auth/github" style={{ color: "#fff", textDecoration: "none" }}>
                                       <span style={{ whiteSpace: "nowrap", fontSize: 14 }}>Sign-in</span>
                                       <span style={{ verticalAlign: "sub", margin: "0 0 0 10px" }} className="mega-octicon octicon-mark-github" title="Sign in with GitHub"></span>
                                   </a>
                               </div>)
                            : ([
                               <div id="signed-in" style={{ position: "absolute", right: 5, cursor: "pointer" }} onClick={e => this.showPopup(e, this.userPopup) }>
                                   <span style={{ whiteSpace: "nowrap", fontSize: 14 }}>{activeSub.displayName}</span>
                                   <img src={activeSub.profileUrl} style={{ verticalAlign: "middle", marginLeft: 5, borderRadius: "50%" }} />
                               </div>,
                               <div id="popup-user" className="popup" ref={e => this.userPopup = e }>
                                   <div onClick={e => location.href = "/auth/logout" }>Sign out</div>
                               </div>
                            ])}
                    </div>
                </div>

                <div id="content">
                    <div id="ide">
                        <div id="editor-menu">
                            <i className="material-icons noselect" onClick={e => this.showPopup(e, this.editorPopup) }>more_vert</i>
                        </div>
                        <div id="popup-editor" className="popup" ref={e => this.editorPopup = e }>
                            {EditorPopup}
                        </div>

                        <Editor ref={e => this.editor = e}
                            files={files}
                            isOwner={isGistOwner}
                            activeFileName={this.props.activeFileName}
                            editingFileName={this.props.editingFileName}
                            selectFileName={fileName => this.props.selectFileName(fileName) }
                            editFileName={fileName => this.props.editFileName(fileName) }
                            showPopup={(e, filesPopup) => this.showPopup(e, filesPopup) }
                            showDialog={dialog => this.props.showDialog(dialog) }
                            updateSource={(fileName, src) => this.props.updateSource(fileName, src) }
                            onRenameFile={(fileName, e) => this.handleRenameFile(fileName, e) }
                            onCreateFile={e => this.handleCreateFile(e) }
                            onShortcut={keyPattern => this.onShortcut(keyPattern)} />

                        <div id="preview">
                            {Preview}
                        </div>
                    </div>
                </div>

                <div id="footer-spacer"></div>

                <div id="footer">
                    <div id="actions" style={{ visibility: meta ? "visible" : "hidden" }} className="noselect">
                        <div id="revert" onClick={e => this.revertGist(e.shiftKey, e.ctrlKey) }>
                            <i className="material-icons">undo</i>
                            <p>Revert Changes</p>
                        </div>
                        { meta && meta.owner_login == authUsername
                            ? (<div id="save" onClick={e => this.saveGist() } className={this.props.dirty ? "" : "disabled"}>
                                <i className="material-icons">save</i>
                                <p>Save Gist</p>
                            </div>)
                            : (<div id="saveas" onClick={e => authUsername ? this.saveGistAs() : this.signIn() }
                                title={!authUsername ? "Sign-in to save gists" : "Save a copy in your Github gists"}>
                                <span className="octicon octicon-repo-forked" style={{ margin: "3px 3px 0 0" }}></span>
                                <p>{authUsername ? (shouldFork ? "Fork As" : "Save As") : "Sign-in to save"}</p>
                            </div>) }
                        { meta && meta.owner_login === authUsername && this.props.activeFileName &&
                            this.props.activeFileName !== FileNames.GistMain &&
                            this.props.activeFileName !== FileNames.GistPackages
                            ? (<div id="delete-file" onClick={e => confirm(`Are you sure you want to delete '${this.props.activeFileName}?`) ? this.deleteFile(this.props.activeFileName) : null }>
                                <i className="material-icons">delete </i>
                                <p>Delete File</p>
                            </div>)
                            : null }
                    </div>

                    { authUsername ? (
                        <i id="btnSnapshot" className="lnk material-icons" title="Take Snapshot"
                            onClick={e =>
                                (capturedSnapshot = store.getState()) && this.props.showDialog("take-snapshot") }>camera_alt</i>) : null }

                    <span id="btnConsole" className="lnk mega-octicon octicon-terminal" title="Console Viewer"
                        onClick={e => this.props.showDialog("console-viewer") }></span>

                    <div id="more-menu" style={{ position: "absolute", right: 5, bottom: 5, color: "#fff", cursor: "pointer" }}>
                        <i className="material-icons" onClick={e => this.showPopup(e, this.morePopup) }>more_vert</i>
                    </div>

                    <div id="popup-more" className="popup" ref={e => this.morePopup = e } style={{ position: "absolute", bottom: 42, right: 0 }}>
                        {MorePopup}
                    </div>
                </div>

                <div id="run" className="noselect">
                    {main != null
                        ? (!isScriptRunning
                            ? <i onClick={e => this.run() } className="material-icons" title="run">play_circle_outline</i>
                            : <i onClick={e => this.cancel() } className="material-icons" title="cancel script" style={{ color: "#FF5252" }}>cancel</i>)
                        : null}

                    {isGistCollection && isGistOwner && (this.props.gist != (collection && collection.id) || !showCollection)
                        ? (<i onClick={e => this.props.changeCollection(this.props.gist, true) } className="material-icons owner" title="View Collection">chevron_right</i>)
                        : null}

                    {showCollection && isCollectionOwner && this.props.gist != collection.id 
                        ? (<i onClick={e => this.props.changeGist(collection.id) } className="material-icons owner" title="Edit Collection">chevron_left</i>)
                        : null}
                </div>

                {meta && this.props.dialog === "save-as"
                    ? <SaveAsDialog dialogRef={e => this.dialog = e} description={description} isPublic={meta.public} shouldFork={shouldFork}
                        onSave={opt => this.saveGist(opt) } onHide={() => this.props.showDialog(null) } />
                    : null}
                {meta && this.props.dialog === "edit-gist"
                    ? <EditGistDialog dialogRef={e => this.dialog = e} description={description}
                        onSave={opt => this.saveGist(opt) } onHide={() => this.props.showDialog(null) } />
                    : null}
                {meta && this.props.dialog === "shortcuts"
                    ? <ShortcutsDialog dialogRef={e => this.dialog = e} onHide={() => this.props.showDialog(null) } />
                    : null}
                {meta && this.props.dialog === "console-viewer"
                    ? <ConsoleViewerDialog dialogRef={e => this.dialog = e} onHide={() => this.props.showDialog(null) } logs={this.props.logs}
                        onClear={() => this.props.clearConsole() && this.props.showDialog(null)} />
                    : null}
                {meta && this.props.dialog === "add-ss-ref"
                    ? <AddServiceStackReferenceDialog dialogRef={e => this.dialog = e} onHide={() => this.props.showDialog(null) }
                        onAddReference={this.handleAddReference.bind(this) }
                        urlChanged={url => this.props.urlChanged(url) && this.props.showDialog(null) } />
                    : null}
                { capturedSnapshot && this.props.dialog === "take-snapshot"
                    ? <TakeSnapshotDialog dialogRef={e => this.dialog = e} description={`Snapshot ${timeFmt12()}`}
                        snapshot={ Object.assign({}, capturedSnapshot, { activeSub: null }) }
                        onHide={() => this.props.showDialog(null) && (capturedSnapshot = null) }
                        urlChanged={url => this.props.urlChanged(url) && this.props.showDialog(null) } />
                    : null}

                {meta && this.props.dialog === "img-upload"
                    ? <ImageUploadDialog dialogRef={e => this.dialog = e} onHide={() => this.props.showDialog(null)} 
                        id={this.props.gist}
                        onChange={url => this.editor.replaceSelection(`![{selection}](${url})\n`)} />
                    : null}
                {meta && this.props.dialog === "insert-link"
                    ? <InsertLinkDialog dialogRef={e => this.dialog = e} onHide={() => this.props.showDialog(null)} 
                        linkLabel={this.editor ? this.editor.getSelection() : ""}
                        gistStats={this.props.gistStats} authUsername={authUsername}
                        onChange={(url,label) => this.props.showDialog(null) && this.editor.replaceSelection(`[${label}](${url})`)} />
                    : null}

                <div id="sig">made with <span>{String.fromCharCode(10084)}</span> by <a target="_blank" href="https://servicestack.net">ServiceStack</a></div>
            </div>
        );
    }
}

const qs = queryString(location.href);
var activeFileName = qs["activeFileName"];

var stateJson = localStorage.getItem(StateKey);
var state = null;
if (stateJson) {
    try {
        state = JSON.parse(stateJson);
        if (activeFileName) {
            state.activeFileName = activeFileName;
        }

        store.dispatch({ type: "LOAD", state });

        if (!qs["gist"] && state.gist != null && !(state.files || state.meta)) {
            store.dispatch({ type: "GIST_CHANGE", gist: state.gist, options: { activeFileName } });
        }

    } catch (e) {
        console.log("ERROR loading state:", e, stateJson);
        localStorage.removeItem(StateKey);
    }
}

var qsSnapshot = qs["snapshot"];
if (qsSnapshot) {
    store.dispatch({ type: "URL_CHANGE", url: qsSnapshot });
}

var qsAddRef = qs["AddServiceStackReference"];
if (qsAddRef) {
    store.dispatch({ type: "GIST_CHANGE", gist: GistTemplates.AddServiceStackReferenceGist });
    store.dispatch({ type: "DIALOG_SHOW", dialog: "add-ss-ref" });
}
else {
    var qsGist = qs["gist"] || GistTemplates.NewGist;
    if (qsGist != (state && state.gist) || (state && !state.meta)) {
        store.dispatch({ type: "GIST_CHANGE", gist: qsGist, options: { activeFileName } });
    }
}

const qsCollection = qs["collection"];
if (qsCollection) {
    store.dispatch({
        type: "COLLECTION_CHANGE",
        collection: { id: qsCollection },
        showCollection: (state && state.showCollection) || qsCollection != (state && state.collection && state.collection.id)
    });
} else if (!state) {
    store.dispatch({ type: "COLLECTION_CHANGE", collection: { id: GistTemplates.HomeCollection }, showCollection: true });
}

const qsExpression = qs["expression"];
if (qsExpression) {
    store.dispatch({ type: "EXPRESSION_SET", expression: qsExpression });
}

const qsClear = qs["clear"];
if (qsClear === "state") {
    localStorage.removeItem(StateKey);
} else if (qsClear === "all") {
    localStorage.clear();
}

window.onpopstate = e => {
    if (!e.state) return;
    if (e.state.gist)
        store.dispatch({ type: "GIST_CHANGE", gist: e.state.gist });
    if (e.state.collection)
        store.dispatch({ type: "COLLECTION_CHANGE", collection: { id: e.state.collection }, showCollection: true });
};

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById("app"));
