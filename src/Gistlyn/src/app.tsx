/// <reference path='../typings/browser.d.ts'/>

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';

import { queryString, JsonServiceClient, ServerEventsClient, ISseConnect, splitOnLast } from './servicestack-client';
import CodeMirror from 'react-codemirror';

import "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js";
import "./codemirror.js";

import { RunScript } from './Gistlyn.dtos';

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

const updateGist = store => next => action => {
    var oldGist = store.getState().gist;
    var result = next(action);

    if (action.type === 'GIST_CHANGE' && action.gist && oldGist !== action.gist) {
        fetch("https://api.github.com/gists/" + action.gist)
            .then((res) => {
                if (!res.ok) {
                    throw res;
                } else {
                    return res.json().then((r) => {
                        store.dispatch({ type: 'GIST_LOAD', files: r.files });
                    });
                }
            })
            .catch(res => {
                store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: `Gist with hash '${action.gist}' was ${res.statusText}` } });
            });
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
                return Object.assign({}, state, { gist: action.gist, error: null, files:null, activeFile:null });
            case 'GIST_LOAD':
                return Object.assign({}, state, { files: action.files, hasLoaded: true });
            case 'FILE_CHANGE':
                return Object.assign({}, state, { activeFile: action.activeFile });
            case 'ERROR_RAISE':
                return Object.assign({}, state, { error: action.error });
            default:
                return state;
        }
    },
    { gist: null, activeSub: null, files: null, activeFile: null, hasLoaded: false, error: null },
    applyMiddleware(updateGist));

var client = new JsonServiceClient("/");
var sse = new ServerEventsClient("/", ["gist"], {
    handlers: {
        onConnect(activeSub:ISseConnect) {
            store.dispatch({ type: 'SSE_CONNECT', activeSub });
        }
    }
});

@reduxify(
    (state) => ({
        gist: state.gist,
        hasLoaded: state.hasLoaded,
        activeSub: state.activeSub,
        files: state.files,
        activeFile: state.activeFile,
        error: state.error
    }),
    (dispatch) => ({
        updateGist: (gist) => dispatch({ type: 'GIST_CHANGE', gist }),
        changeTab: (activeFile) => dispatch({ type: 'FILE_CHANGE', activeFile }),
        raiseError: (error) => dispatch({ type: 'ERROR_RAISE', error }),
        clearError: () => dispatch({ type: 'ERROR_CLEAR' })
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

        client.post(request)
            .then(r => {
                console.log('success', r);
            })
            .catch(r => {
                console.log('error', r);
                this.props.raiseError(r.responseStatus);
            });
    }

    handleGistUpdate(e: React.FormEvent) {
        const target = e.target as HTMLInputElement;
        const parts = splitOnLast(target.value, '/');
        const hash = parts[parts.length - 1];
        this.props.updateGist(hash);
    }

    render() {

        let source = "";
        const Tabs = [];

        if (this.props.files) {
            var keys = Object.keys(this.props.files);
            keys.sort((a, b) => {
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

            keys.forEach((k) => {
                const file = this.props.files[k];
                const active = k === this.props.activeFile ||
                    (this.props.activeFile == null && k.toLowerCase() === "main.cs");

                Tabs.push((
                    <div className={active ? 'active' : null}
                        onClick={e => this.props.changeTab(file.filename) }><b>
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

        var main = this.getMainFile();
        if (this.props.hasLoaded && this.props.gist && this.props.files && main == null && this.props.error == null) {
            this.props.error = { message: "main.cs is missing" };
        }

        var Preview = <span>preview</span>;

        if (this.props.error != null) {
            var code = this.props.error.errorCode ? `(${this.props.error.errorCode}) ` : ""; 
            Preview = (<div id="errors">
                <div style={{ margin: '10px' }} className="alert alert-error">
                    {code}{this.props.error.message}
                </div>
                { this.props.error.stackTrace != null
                    ? <pre style={{ color: "red", padding: "5px 30px" }}>{this.props.error.stackTrace}</pre>
                    : null}
            </div>);
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
                        <div className="editor">
                            <div id="tabs">
                                {Tabs}
                            </div>
                            <CodeMirror value={source} options={options} />
                        </div>
                        <div className="preview">
                            {Preview}
                        </div>
                    </div>
                </div>

                <div id="footer">
                    <div id="run">
                        {main != null
                            ? <i className="material-icons" title="run" onClick={this.run}>play_arrow</i>
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
