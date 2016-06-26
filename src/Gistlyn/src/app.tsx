// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/browser.d.ts'/>

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';

import { queryString } from './utils';
import CodeMirror from 'react-codemirror';

import "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js";
import "./codemirror.js";

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
    var result = next(action);

    if (action.type === 'GIST_CHANGE') {
        fetch("https://api.github.com/gists/" + gist)
            .then((res) => res.json().then((r) => {
                //console.log('loading files...', r.files);
                store.dispatch({ type: 'GIST_LOAD', files: r.files });
            }));
    }

    return result;
};

function reduxify(mapStateToProps, mapDispatchToProps?, mergeProps?, options?) {
    return target => (connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target) as any);
}

let store = createStore(
    (state, action) => {
        switch (action.type) {
            case 'GIST_CHANGE':
                return Object.assign({}, state, { gist: action.gist });
            case 'GIST_LOAD':
                return Object.assign({}, state, { files: action.files });
            case 'FILE_CHANGE':
                return Object.assign({}, state, { activeFile: action.activeFile });
            default:
                return state;
        }
    },
    { gist: null, files: {}, activeFile: null },
    applyMiddleware(updateGist));

@reduxify(
    (state) => ({
        gist: state.gist,
        files: state.files,
        activeFile: state.activeFile
    }),
    (dispatch) => ({
        updateGist: (gist) => dispatch({ type: 'GIST_CHANGE', gist }),
        changeTab: (activeFile) => dispatch({ type: 'FILE_CHANGE', activeFile })
    })
)
class App extends React.Component<any, any> {

    render() {
        const handleGistUpdate = (e: React.FormEvent) => {
            const target = e.target as HTMLInputElement;
            var gist = target.value;
            this.props.updateGist(gist);
        }

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

        let source = "";

        const Tabs = [];
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

        return (
            <div id="body">
                <div className="titlebar">
                    <div className="container">
                        <img id="logo" src="img/logo-32-inverted.png" />
                        <h3>Gistlyn</h3> <sup style={{ padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}>BETA</sup>
                        <div id="gist">
                            <input type="text" id="txtGist" placeholder="gist hash or url" 
                                   value={this.props.gist}
                                   onChange={e => handleGistUpdate(e) } />
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
                        <div className="preview">preview</div>
                    </div>
                </div>

                <div id="footer"></div>
            </div>
        );
    }
}

var gist = queryString(location.href)["gist"] || "6831799881c92434f80e141c8a2699eb";

store.dispatch({ type: 'GIST_CHANGE', gist });

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById("app"));
