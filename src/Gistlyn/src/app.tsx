/// <reference path='../typings/browser.d.ts'/>

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';

import { queryString, JsonServiceClient, ServerEventsClient, ISseConnect, splitOnLast, humanize } from './servicestack-client';
import CodeMirror from 'react-codemirror';

import "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js";
import "./codemirror.js";

import { RunScript, GetScriptStatus, CancelScript, GetScriptVariables } from './Gistlyn.dtos';

var options = {
    lineNumbers: true,
    matchBrackets: true,
    indentUnit: 4,
    mode: "text/x-csharp",
    extraKeys: {
        "F11" (cm) {
            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc" (cm) {
            if (cm.getOption("fullScreen"))
                cm.setOption("fullScreen", false);
        }
    }
};

const ScriptStatusRunning = ["Started", "PrepareToRun", "Running"];

const updateGist = store => next => action => {
    var oldGist = store.getState().gist;
    var result = next(action);
    var state = store.getState();
    const gistCacheKey = `/v1/gists/${state.gist}`;

    if (action.type === 'GIST_CHANGE' && action.gist && oldGist !== action.gist) {
        const json = localStorage.getItem(gistCacheKey);
        if (json) {
            const files = JSON.parse(json);
            store.dispatch({ type: 'GIST_LOAD', files, activeFileName: getSortedFileNames(files)[0] });
        } else {
            fetch("https://api.github.com/gists/" + action.gist)
                .then((res) => {
                    if (!res.ok) {
                        throw res;
                    } else {
                        return res.json().then((r) => {
                            localStorage.setItem(gistCacheKey, JSON.stringify(r.files));
                            store.dispatch({ type: 'GIST_LOAD', files: r.files, activeFileName: getSortedFileNames(r.files)[0] });
                        });
                    }
                })
                .catch(res => {
                    store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: `Gist with hash '${action.gist}' was ${res.statusText}` } });
                });
        }
    } else if (action.type === "SOURCE_CHANGE") {
        localStorage.setItem(gistCacheKey, JSON.stringify(state.files));
    }

    return result;
};

function reduxify(mapStateToProps, mapDispatchToProps?, mergeProps?, options?) {
    return target => (connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target) as any);
}

let store = createStore(
    (state, action) => {
        switch (action.type) {
            case 'SSE_CONNECT':
                return Object.assign({}, state, { activeSub: action.activeSub });
            case 'GIST_CHANGE':
                return Object.assign({}, state, { gist: action.gist, error: null, files:null, activeFileName:null });
            case 'GIST_LOAD':
                return Object.assign({}, state, { files: action.files, activeFileName:action.activeFileName, hasLoaded: true });
            case 'FILE_SELECT':
                return Object.assign({}, state, { activeFileName: action.activeFileName });
            case 'ERROR_RAISE':
                return Object.assign({}, state, { error: action.error });
            case 'CONSOLE_LOG':
                return Object.assign({}, state, { logs: [...state.logs, ...action.logs] });
            case 'SCRIPT_STATUS':
                return Object.assign({}, state, { scriptStatus: action.scriptStatus });
            case 'SOURCE_CHANGE':
                const file = Object.assign({}, state.files[action.fileName], { content: action.content });
                return Object.assign({}, state, { files: Object.assign({}, state.files, { [action.fileName]: file }) });
            default:
                return state;
        }
    },
    {
        gist: null, 
        activeSub: null, 
        files: null, 
        activeFileName: null, 
        hasLoaded: false, 
        error: null, 
        logs:[], 
        scriptStatus:null 
    },
    applyMiddleware(updateGist));

var client = new JsonServiceClient("/");
var sse = new ServerEventsClient("/", ["gist"], {
    handlers: {
        onConnect(activeSub:ISseConnect) {
            store.dispatch({ type: 'SSE_CONNECT', activeSub });
        },
        ConsoleMessage(m, e) {
            //console.log("ConsoleMessage", m, e);
            store.dispatch({ type: 'CONSOLE_LOG', logs: [m.message] });
        },
        ScriptExecutionResult(m, e) {
            //console.log("ScriptExecutionResult", m, e);
            if (m.status === store.getState().scriptStatus) return;

            store.dispatch({ type: 'CONSOLE_LOG', logs: [humanize(m.status)] });
            store.dispatch({ type: 'SCRIPT_STATUS', scriptStatus: m.status });

            if (m.status === "CompiledWithErrors" && m.errors) {
                const errorMsgs = m.errors.map(e => <span className="error">{e.info}</span>);
                store.dispatch({ type: 'CONSOLE_LOG', logs: errorMsgs });
            }
        }
    }
});

const getSortedFileNames = (files) => {
    const fileNames = Object.keys(files);
    fileNames.sort((a, b) => {
        if (a.toLowerCase() === "main.cs")
            return -1;
        if (b.toLowerCase() === "main.cs")
            return 1;
        if (!a.endsWith(".cs") && b.endsWith(".cs"))
            return 1;
        if (a === b)
            return 0;
        return a < b ? -1 : 0;
    });
    return fileNames;
};

@reduxify(
    (state) => ({
        gist: state.gist,
        hasLoaded: state.hasLoaded,
        activeSub: state.activeSub,
        files: state.files,
        activeFileName: state.activeFileName,
        logs: state.logs,
        error: state.error,
        scriptStatus: state.scriptStatus
    }),
    (dispatch) => ({
        updateGist: (gist) => dispatch({ type: 'GIST_CHANGE', gist }),
        updateSource: (fileName, content) => dispatch({ type: 'SOURCE_CHANGE', fileName, content }),
        selectFileName: (activeFileName) => dispatch({ type: 'FILE_SELECT', activeFileName }),
        raiseError: (error) => dispatch({ type: 'ERROR_RAISE', error }),
        clearError: () => dispatch({ type: 'ERROR_CLEAR' }),
        logToConsole: (logs) => dispatch({ type:'CONSOLE_LOG', logs }),
        setScriptStatus: (scriptStatus) => dispatch({ type:'SCRIPT_STATUS', scriptStatus })
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

    getFileContents(fileName:string):string {
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

        client.post(request)
            .then(r => {
                console.log('run success', r);
                this.props.logToConsole(r.references.map(ref => `loaded ${ref.name}`));
            })
            .catch(r => {
                console.log('run error', r);
                this.props.raiseError(r.responseStatus);
                this.props.setScriptStatus("Failed");
            });
    }

    cancel = () => {
        this.props.clearError();
        const request = new CancelScript();
        request.scriptId = this.scriptId;
        client.post(request)
            .then(r => {
                console.log('cancel success', r);
                this.props.setScriptStatus("Cancelled");
                this.props.logToConsole(["Cancelled by user"]);
            })
            .catch(r => {
                console.log('cancel error', r);
                this.props.raiseError(r.responseStatus);
                this.props.setScriptStatus("Failed");
            });
    }

    handleGistUpdate(e: React.FormEvent) {
        const target = e.target as HTMLInputElement;
        const parts = splitOnLast(target.value, '/');
        const hash = parts[parts.length - 1];
        this.props.updateGist(hash);
    }

    updateSource(src: string) {
        this.props.updateSource(this.props.activeFileName, src);
    }

    consoleScroll:HTMLDivElement;

    componentDidUpdate() {
        if (!this.consoleScroll) return;
        this.consoleScroll.scrollTop = this.consoleScroll.scrollHeight;
    }

    render() {

        let source = "";
        const Tabs = [];

        if (this.props.files) {
            var keys = getSortedFileNames(this.props.files);

            keys.forEach((k) => {
                const file = this.props.files[k];
                const active = k === this.props.activeFileName ||
                    (this.props.activeFileName == null && k.toLowerCase() === "main.cs");

                Tabs.push((
                    <div className={active ? 'active' : null}
                        onClick={e => this.props.selectFileName(file.filename) }><b>
                            {file.filename}
                        </b></div>
                ));

                if (active) {
                    source = file.content;
                    options["mode"] = file.filename.endsWith('.config')
                        ? "application/xml"
                        : "text/x-csharp";
                }
            });
        }

        const main = this.getMainFile();
        if (this.props.hasLoaded && this.props.gist && this.props.files && main == null && this.props.error == null) {
            this.props.error = { message: "main.cs is missing" };
        }

        const isScriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;

        var Preview = [(
            <div id="vars" className="section">
                {isScriptRunning
                 ? (<div style={{ margin: '40px', color: "#31708f" }}>
                        <i className="material-icons" style={{position:"absolute"}}>build</i>
                        <p style={{padding:"0 0 0 30px", fontSize:"22px"}}>Executing Script...</p>
                    </div>)
                 : null}
            </div>
        )];

        if (this.props.error != null) {
            var code = this.props.error.errorCode ? `(${this.props.error.errorCode}) ` : ""; 
            Preview = [(
                <div id="errors" className="section">
                    <div style={{ margin: "25px 25px 40px 25px", color: "#a94442" }}>
                        {code}{this.props.error.message}
                    </div>
                    { this.props.error.stackTrace != null
                        ? <pre style={{ color: "red", padding: "5px 30px" }}>{this.props.error.stackTrace}</pre>
                        : null}
                </div>)];
        }

        if (this.props.logs.length > 0) {
            Preview.push((
                <div id="console" className="section" style={{borderBottom:"solid 1px #ddd"}}>
                    <div className="head" style={{font:"14px/20px arial", height:"22px", textAlign:"right", borderBottom:"solid 1px #ddd"}}>
                        <b style={{ background:"#444", color:"#fff", padding:"4px 8px" }}>console</b>
                    </div>
                    <div className="scroll" style={{overflow:"auto", maxHeight:"350px"}} ref={(el) => this.consoleScroll = el}>
                        <table style={{width:"100%"}}>
                            <tbody style={{font:"13px/18px monospace", color:"#444"}}>
                                {this.props.logs.map(log => (
                                    <tr>
                                        <td style={{padding:"2px 8px"}}>{log}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>));
        }

        return (
            <div id="body">
                <div className="titlebar">
                    <div className="container">
                        <img id="logo" src="img/logo-32-inverted.png" />
                        <h3>Gistlyn</h3> <sup style={{ padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}>BETA</sup>
                        <div id="gist">
                            <input type="text" id="txtGist" placeholder="gist hash or url" 
                                   value={this.props.gist}
                                   onFocus={e => (e.target as HTMLInputElement).select() }
                                   onChange={e => this.handleGistUpdate(e) } />
                            { main != null
                                ? <i className="material-icons" style={{ color: "#0f9", fontSize: "30px", position:"absolute", margin: "-2px 0 0 7px"}}>check</i>
                                : this.props.error
                                    ? <i className="material-icons" style={{ color: "#ebccd1", fontSize: "30px", position: "absolute", margin:"-2px 0 0 7px" }}>error</i>
                                    : null }
                        </div>
                    </div>
                </div>

                <div id="content">
                    <div id="ide">
                        <div id="editor">
                            <div id="tabs" style={{display: this.props.files ? 'flex' : 'none'}}>
                                {Tabs}
                            </div>
                            <CodeMirror value={source} options={options} onChange={src => this.updateSource(src)} />
                        </div>
                        <div id="preview">
                            {Preview}
                        </div>
                    </div>
                </div>

                <div id="footer">
                    <div id="run">
                        {main != null
                            ? (!isScriptRunning 
                                ? <i className="material-icons" title="run" onClick={this.run}>play_arrow</i>
                                : <i className="material-icons" title="cancel script" onClick={this.cancel} style={{ color:"#FF5252" }}>cancel</i>)
                            : <i className="material-icons disabled" title="disabled">play_arrow</i>}
                    </div>
                </div>
            </div>
        );
    }
}

var qsGist = queryString(location.href)["gist"] || "efc71477cee60916ef71d839084d1afd";

store.dispatch({ type: 'GIST_CHANGE', gist: qsGist });

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById("app"));
