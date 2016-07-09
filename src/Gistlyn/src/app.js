/// <reference path='../typings/index.d.ts'/>
System.register(['react', 'react-dom', 'react-redux', './utils', './state', './servicestack-client', './json-viewer', 'react-codemirror', "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js", "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js", "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js", "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js", "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js", "./codemirror.js", './Gistlyn.dtos'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var React, ReactDOM, react_redux_1, utils_1, state_1, servicestack_client_1, json_viewer_1, react_codemirror_1, Gistlyn_dtos_1;
    var options, ScriptStatusRunning, ScriptStatusError, client, sse, App, stateJson, state, e, qsGist;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (react_redux_1_1) {
                react_redux_1 = react_redux_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (state_1_1) {
                state_1 = state_1_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            },
            function (json_viewer_1_1) {
                json_viewer_1 = json_viewer_1_1;
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
            function (Gistlyn_dtos_1_1) {
                Gistlyn_dtos_1 = Gistlyn_dtos_1_1;
            }],
        execute: function() {
            options = {
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
                    }
                }
            };
            ScriptStatusRunning = ["Started", "PrepareToRun", "Running"];
            ScriptStatusError = ["Cancelled", "CompiledWithErrors", "ThrowedException"];
            client = new servicestack_client_1.JsonServiceClient("/");
            sse = new servicestack_client_1.ServerEventsClient("/", ["gist"], {
                handlers: {
                    onConnect: function (activeSub) {
                        state_1.store.dispatch({ type: 'SSE_CONNECT', activeSub: activeSub });
                    },
                    ConsoleMessage: function (m, e) {
                        state_1.store.dispatch({ type: 'CONSOLE_LOG', logs: [{ msg: m.message }] });
                    },
                    ScriptExecutionResult: function (m, e) {
                        if (m.status === state_1.store.getState().scriptStatus)
                            return;
                        var cls = ScriptStatusError.indexOf(m.status) >= 0 ? "error" : "";
                        state_1.store.dispatch({ type: 'CONSOLE_LOG', logs: [{ msg: servicestack_client_1.humanize(m.status), cls: cls }] });
                        state_1.store.dispatch({ type: 'SCRIPT_STATUS', scriptStatus: m.status });
                        if (m.status === "CompiledWithErrors" && m.errors) {
                            var errorMsgs = m.errors.map(function (e) { return ({ msg: e.info, cls: "error" }); });
                            state_1.store.dispatch({ type: 'CONSOLE_LOG', logs: errorMsgs });
                        }
                        else if (m.status === "Completed") {
                            var request = new Gistlyn_dtos_1.GetScriptVariables();
                            request.scriptId = state_1.store.getState().activeSub.id;
                            client.get(request)
                                .then(function (r) {
                                state_1.store.dispatch({ type: "VARS_LOAD", variables: r.variables });
                            });
                        }
                    }
                }
            });
            App = (function (_super) {
                __extends(App, _super);
                function App() {
                    var _this = this;
                    _super.apply(this, arguments);
                    this.run = function () {
                        _this.props.clearError();
                        var request = new Gistlyn_dtos_1.RunScript();
                        request.scriptId = _this.scriptId;
                        request.mainSource = _this.getMainFile().content;
                        request.packagesConfig = _this.getFileContents("packages.config");
                        request.sources = [];
                        for (var k in _this.props.files || []) {
                            if (k.endsWith(".cs") && k.toLowerCase() !== "main.cs")
                                request.sources.push(_this.props.files[k].content);
                        }
                        _this.props.setScriptStatus("Started");
                        client.post(request)
                            .then(function (r) {
                            _this.props.logConsoleMsgs(r.references.map(function (ref) { return ("loaded " + ref.name); }));
                        })
                            .catch(function (r) {
                            _this.props.raiseError(r.responseStatus);
                            _this.props.setScriptStatus("Failed");
                        });
                    };
                    this.cancel = function () {
                        _this.props.clearError();
                        var request = new Gistlyn_dtos_1.CancelScript();
                        request.scriptId = _this.scriptId;
                        client.post(request)
                            .then(function (r) {
                            _this.props.setScriptStatus("Cancelled");
                            _this.props.logConsole([{ msg: "Cancelled by user", cls: "error" }]);
                        })
                            .catch(function (r) {
                            _this.props.raiseError(r.responseStatus);
                            _this.props.setScriptStatus("Failed");
                        });
                    };
                }
                App.prototype.getFile = function (fileName) {
                    if (this.props.files == null)
                        return null;
                    for (var k in this.props.files) {
                        if (k.toLowerCase() === fileName) {
                            return this.props.files[k];
                        }
                    }
                    return null;
                };
                App.prototype.getFileContents = function (fileName) {
                    var file = this.getFile(fileName);
                    return file != null
                        ? file.content
                        : null;
                };
                App.prototype.getMainFile = function () {
                    return this.getFile("main.cs");
                };
                Object.defineProperty(App.prototype, "scriptId", {
                    get: function () {
                        return this.props.activeSub && this.props.activeSub.id;
                    },
                    enumerable: true,
                    configurable: true
                });
                App.prototype.handleGistUpdate = function (e) {
                    var target = e.target;
                    var parts = servicestack_client_1.splitOnLast(target.value, '/');
                    var hash = parts[parts.length - 1];
                    this.props.updateGist(hash);
                };
                App.prototype.updateSource = function (src) {
                    this.props.updateSource(this.props.activeFileName, src);
                };
                App.prototype.inspectVariable = function (v) {
                    var _this = this;
                    var request = new Gistlyn_dtos_1.GetScriptVariables();
                    request.scriptId = this.scriptId;
                    request.variableName = v.name;
                    client.get(request)
                        .then(function (r) {
                        if (r.status !== "Completed") {
                            var msg = r.status === "Unknown"
                                ? "Script no longer exists on server"
                                : "Script Error: " + servicestack_client_1.humanize(r.status);
                            _this.props.logConsole([{ msg: msg, cls: "error" }]);
                        }
                        else {
                            _this.props.inspectVariable(v.name, r.variables);
                        }
                    });
                };
                App.prototype.getVariableRows = function (v) {
                    var _this = this;
                    var varProps = this.props.inspectedVariables[v.name];
                    var rows = [(React.createElement("tr", null, React.createElement("td", {className: "name", style: { whiteSpace: "nowrap" }}, v.isBrowseable
                            ? (varProps
                                ? React.createElement("span", {className: "octicon octicon-triangle-down", style: { margin: "0 10px 0 0" }, onClick: function (e) { return _this.props.inspectVariable(v.name, null); }})
                                : React.createElement("span", {className: "octicon octicon-triangle-right", style: { margin: "0 10px 0 0" }, onClick: function (e) { return _this.inspectVariable(v); }}))
                            : React.createElement("span", {className: "octicon octicon-triangle-right", style: { margin: "0 10px 0 0", color: "#f7f7f7" }}), React.createElement("a", {onClick: function (e) { return _this.setAndEvaluateExpression(v.name); }}, v.name)), React.createElement("td", {className: "value"}, v.value), React.createElement("td", {className: "type"}, v.type)))];
                    if (varProps) {
                        varProps.forEach(function (p) {
                            rows.push((React.createElement("tr", null, React.createElement("td", {className: "name", style: { padding: "0 0 0 50px" }}, p.canInspect
                                ? React.createElement("a", {onClick: function (e) { return _this.setAndEvaluateExpression(v.name + (p.name[0] != "[" ? "." : "") + p.name); }}, p.name)
                                : React.createElement("span", {style: { color: "#999" }}, p.name)), React.createElement("td", {className: "value"}, p.value), React.createElement("td", {className: "type"}, p.type))));
                        });
                    }
                    return rows;
                };
                App.prototype.setAndEvaluateExpression = function (expr) {
                    this.props.setExpression(expr);
                    this.evaluateExpression(expr);
                };
                App.prototype.evaluateExpression = function (expr) {
                    var _this = this;
                    if (!expr) {
                        this.props.setExpression(expr);
                        return;
                    }
                    var request = new Gistlyn_dtos_1.EvaluateExpression();
                    request.scriptId = this.scriptId;
                    request.expression = expr;
                    request.includeJson = true;
                    client.post(request)
                        .then(function (r) {
                        if (r.result.errors && r.result.errors.length > 0) {
                            r.result.errors.forEach(function (x) {
                                _this.props.logConsole({ msg: x.info, cls: "error" });
                            });
                        }
                        else {
                            _this.props.setExpressionResult(r.result);
                        }
                    })
                        .catch(function (e) {
                        _this.props.logConsoleError(e.responseStatus || e); //both have schema `{ message }`
                    });
                };
                App.prototype.revertGist = function (clearAll) {
                    if (clearAll === void 0) { clearAll = false; }
                    localStorage.removeItem(state_1.GistCacheKey(this.props.gist));
                    if (clearAll) {
                        localStorage.removeItem(state_1.StateKey);
                    }
                    this.props.updateGist(this.props.gist, true);
                };
                App.prototype.componentDidUpdate = function () {
                    if (!this.consoleScroll)
                        return;
                    this.consoleScroll.scrollTop = this.consoleScroll.scrollHeight;
                    window.onkeydown = this.handleWindowKeyDown.bind(this);
                };
                App.prototype.showDialog = function (e, el) {
                    if (el === this.lastDialog)
                        return;
                    e.stopPropagation();
                    this.lastDialog = el;
                    el.style.display = "block";
                };
                App.prototype.handleBodyClick = function (e) {
                    if (this.lastDialog != null) {
                        this.lastDialog.style.display = "none";
                        this.lastDialog = null;
                    }
                };
                App.prototype.handleWindowKeyDown = function (e) {
                    var target = e.target;
                    if (target.tagName === "TEXTAREA" || target.tagName === "INPUT")
                        return;
                    if (e.ctrlKey && (e.keyCode === 37 || e.keyCode === 39)) {
                        if (!this.props.files || this.props.files.length === 0)
                            return;
                        e.stopPropagation();
                        var keys = utils_1.getSortedFileNames(this.props.files);
                        var activeIndex = Math.max(0, keys.indexOf(this.props.activeFileName));
                        var nextFileIndex = activeIndex + (e.keyCode === 37 ? -1 : 1);
                        nextFileIndex = nextFileIndex < 0
                            ? keys.length - 1
                            : nextFileIndex % keys.length;
                        this.props.selectFileName(keys[nextFileIndex]);
                    }
                };
                App.prototype.render = function () {
                    var _this = this;
                    var source = "";
                    var Tabs = [];
                    var FileList = [];
                    if (this.props.files) {
                        var keys = utils_1.getSortedFileNames(this.props.files);
                        keys.forEach(function (k) {
                            var file = _this.props.files[k];
                            var active = k === _this.props.activeFileName ||
                                (_this.props.activeFileName == null && k.toLowerCase() === "main.cs");
                            Tabs.push((React.createElement("div", {className: active ? 'active' : null, onClick: function (e) { return _this.props.selectFileName(file.filename); }}, React.createElement("b", null, file.filename))));
                            FileList.push((React.createElement("div", {className: "file", onClick: function (e) { return _this.props.selectFileName(file.filename); }}, React.createElement("div", null, file.filename))));
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
                    var isScriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;
                    var Preview = [];
                    if (this.props.error != null) {
                        var code = this.props.error.errorCode ? "(" + this.props.error.errorCode + ") " : "";
                        Preview.push((React.createElement("div", {id: "errors", className: "section"}, React.createElement("div", {style: { margin: "25px 25px 40px 25px", color: "#a94442" }}, code, this.props.error.message), this.props.error.stackTrace != null
                            ? React.createElement("pre", {style: { color: "red", padding: "5px 30px" }}, this.props.error.stackTrace)
                            : null)));
                    }
                    else if (isScriptRunning) {
                        Preview.push((React.createElement("div", {id: "status", className: "section"}, React.createElement("div", {style: { margin: '40px', color: "#444", width: "215px" }, title: "executing..."}, React.createElement("img", {src: "/img/ajax-loader.gif", style: { float: "right", margin: "5px 0 0 0" }}), React.createElement("i", {className: "material-icons", style: { position: "absolute" }}, "build"), React.createElement("p", {style: { padding: "0 0 0 30px", fontSize: "22px" }}, "Executing Script")))));
                    }
                    else if (this.props.variables.length > 0) {
                        var vars = this.props.variables;
                        var exprResult = this.props.expressionResult;
                        var exprVar = exprResult != null && exprResult.variables.length > 0 ? exprResult.variables[0] : null;
                        Preview.push((React.createElement("div", {id: "vars", className: "section"}, React.createElement("table", {style: { width: "100%" }}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {className: "name"}, "name"), React.createElement("th", {className: "value"}, "value"), React.createElement("th", {className: "type"}, "type"))), React.createElement("tbody", null, vars.map(function (v) { return _this.getVariableRows(v); }))), React.createElement("div", {id: "evaluate"}, React.createElement("input", {type: "text", placeholder: "Evaluate Expression", value: this.props.expression, onChange: function (e) { return _this.props.setExpression(e.target.value); }, onKeyPress: function (e) { return e.which === 13 ? _this.evaluateExpression(_this.props.expression) : null; }, autocomplete: "off", autocorrect: "off", autocapitalize: "off", spellcheck: "false"}), React.createElement("i", {className: "material-icons", title: "run", onClick: function (e) { return _this.evaluateExpression(_this.props.expression); }}, "play_arrow"), exprVar
                            ? (React.createElement("div", {id: "expression-result"}, React.createElement(json_viewer_1.JsonViewer, {json: exprVar.json})))
                            : null))));
                    }
                    else {
                        Preview.push(React.createElement("div", {id: "placeholder"}));
                    }
                    if (this.props.logs.length > 0) {
                        Preview.push((React.createElement("div", {id: "console", className: "section", style: { borderTop: "solid 1px #ddd", borderBottom: "solid 1px #ddd", font: "14px/20px arial", height: "350px" }}, React.createElement("b", {style: { background: "#444", color: "#fff", padding: "1px 8px", position: "absolute", right: "3px", margin: "-22px 0" }}, "console"), React.createElement("i", {className: "material-icons clear-btn", title: "clear console", onClick: function (e) { return _this.props.clearConsole(); }}, "clear"), React.createElement("div", {className: "scroll", style: { overflow: "auto", maxHeight: "350px" }, ref: function (el) { return _this.consoleScroll = el; }}, React.createElement("table", {style: { width: "100%" }}, React.createElement("tbody", {style: { font: "13px/18px monospace", color: "#444" }}, this.props.logs.map(function (log) { return (React.createElement("tr", null, React.createElement("td", {style: { padding: "2px 8px", tabSize: 4 }}, React.createElement("pre", {className: log.cls}, log.msg)))); })))))));
                    }
                    var activeSub = this.props.activeSub;
                    return (React.createElement("div", {id: "body", onClick: function (e) { return _this.handleBodyClick(e); }}, React.createElement("div", {className: "titlebar"}, React.createElement("div", {className: "container"}, React.createElement("a", {href: "https://servicestack.net", title: "servicestack.net", target: "_blank"}, React.createElement("img", {id: "logo", src: "img/logo-32-inverted.png"})), React.createElement("h3", null, "Gistlyn"), " ", React.createElement("sup", {style: { padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}, "BETA"), React.createElement("div", {id: "gist"}, this.props.meta
                        ? React.createElement("img", {src: this.props.meta.owner_avatar_url, title: this.props.meta.description, style: { verticalAlign: "middle", margin: "0 5px 2px 0" }})
                        : null, React.createElement("input", {type: "text", id: "txtGist", placeholder: "gist hash or url", value: this.props.gist, onFocus: function (e) { return e.target.select(); }, onChange: function (e) { return _this.handleGistUpdate(e); }}), main != null
                        ? React.createElement("i", {className: "material-icons", style: { color: "#0f9", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}, "check")
                        : this.props.error
                            ? React.createElement("i", {className: "material-icons", style: { color: "#ebccd1", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}, "error")
                            : null), activeSub == null || parseInt(activeSub.userId) < 0
                        ? (React.createElement("div", {id: "sign-in", style: { position: "absolute", right: 5 }}, React.createElement("a", {href: "/auth/github", style: { color: "#fff", textDecoration: "none" }}, React.createElement("span", {style: { whiteSpace: "nowrap", fontSize: 14 }}, "sign-in"), React.createElement("span", {style: { verticalAlign: "sub", margin: "0 0 0 10px" }, className: "mega-octicon octicon-mark-github", title: "Sign in with GitHub"}))))
                        : (React.createElement("div", {id: "signed-in", style: { position: "absolute", right: 5 }}, React.createElement("span", {style: { whiteSpace: "nowrap", fontSize: 14 }}, activeSub.displayName), React.createElement("img", {src: activeSub.profileUrl, style: { verticalAlign: "middle", marginLeft: 5, borderRadius: "50%" }}))))), React.createElement("div", {id: "content"}, React.createElement("div", {id: "ide"}, React.createElement("div", {id: "editor"}, React.createElement("div", {id: "tabs", style: { display: this.props.files ? 'flex' : 'none' }}, FileList.length > 0
                        ? React.createElement("i", {id: "files-menu", className: "material-icons", onClick: function (e) { return _this.showDialog(e, _this.filesList); }}, "arrow_drop_down") : null, Tabs), React.createElement("div", {id: "files-list", ref: function (e) { return _this.filesList = e; }}, FileList), React.createElement(react_codemirror_1.default, {value: source, options: options, onChange: function (src) { return _this.updateSource(src); }})), React.createElement("div", {id: "preview"}, Preview))), React.createElement("div", {id: "footer-spacer"}), React.createElement("div", {id: "footer"}, React.createElement("div", {id: "actions"}, React.createElement("div", {id: "revert", onClick: function (e) { return _this.revertGist(e.shiftKey); }}, React.createElement("i", {className: "material-icons"}, "undo"), React.createElement("p", null, "Revert Changes")))), React.createElement("div", {id: "run", className: main == null ? "disabled" : "", onClick: function (e) { return !isScriptRunning ? _this.run() : _this.cancel(); }}, main != null
                        ? (!isScriptRunning
                            ? React.createElement("i", {className: "material-icons", title: "run"}, "play_circle_outline")
                            : React.createElement("i", {className: "material-icons", title: "cancel script", style: { color: "#FF5252" }}, "cancel"))
                        : React.createElement("i", {className: "material-icons", title: "disabled"}, "play_circle_outline"))));
                };
                App = __decorate([
                    utils_1.reduxify(function (state) { return ({
                        gist: state.gist,
                        hasLoaded: state.hasLoaded,
                        activeSub: state.activeSub,
                        meta: state.meta,
                        files: state.files,
                        activeFileName: state.activeFileName,
                        logs: state.logs,
                        variables: state.variables,
                        inspectedVariables: state.inspectedVariables,
                        expression: state.expression,
                        expressionResult: state.expressionResult,
                        error: state.error,
                        scriptStatus: state.scriptStatus
                    }); }, function (dispatch) { return ({
                        updateGist: function (gist, reload) {
                            if (reload === void 0) { reload = false; }
                            return dispatch({ type: 'GIST_CHANGE', gist: gist, reload: reload });
                        },
                        updateSource: function (fileName, content) { return dispatch({ type: 'SOURCE_CHANGE', fileName: fileName, content: content }); },
                        selectFileName: function (activeFileName) { return dispatch({ type: 'FILE_SELECT', activeFileName: activeFileName }); },
                        raiseError: function (error) { return dispatch({ type: 'ERROR_RAISE', error: error }); },
                        clearError: function () { return dispatch({ type: 'ERROR_CLEAR' }); },
                        clearConsole: function () { return dispatch({ type: 'CONSOLE_CLEAR' }); },
                        logConsole: function (logs) { return dispatch({ type: 'CONSOLE_LOG', logs: logs }); },
                        logConsoleError: function (status) { return dispatch({ type: 'CONSOLE_LOG', logs: [Object.assign({ msg: status.message, cls: "error" }, status)] }); },
                        logConsoleMsgs: function (txtMessages) { return dispatch({ type: 'CONSOLE_LOG', logs: txtMessages.map(function (msg) { return ({ msg: msg }); }) }); },
                        setScriptStatus: function (scriptStatus) { return dispatch({ type: 'SCRIPT_STATUS', scriptStatus: scriptStatus }); },
                        inspectVariable: function (name, variables) { return dispatch({ type: 'VARS_INSPECT', name: name, variables: variables }); },
                        setExpression: function (expression) { return dispatch({ type: 'EXPRESSION_SET', expression: expression }); },
                        setExpressionResult: function (expressionResult) { return dispatch({ type: 'EXPRESSION_LOAD', expressionResult: expressionResult }); }
                    }); })
                ], App);
                return App;
            }(React.Component));
            stateJson = localStorage.getItem(state_1.StateKey);
            state = null;
            if (stateJson) {
                try {
                    state = JSON.parse(stateJson);
                    state_1.store.dispatch({ type: 'LOAD', state: state });
                    if (state.gist != null && !(state.files || state.meta)) {
                        state_1.store.dispatch({ type: 'GIST_CHANGE', gist: state.gist });
                    }
                }
                catch (e) {
                    console.log('ERROR loading state:', e, stateJson);
                    localStorage.removeItem(state_1.StateKey);
                }
            }
            qsGist = servicestack_client_1.queryString(location.href)["gist"] || "4fab2fa13aade23c81cabe83314c3cd0";
            if (qsGist != (state && state.gist)) {
                state_1.store.dispatch({ type: 'GIST_CHANGE', gist: qsGist });
            }
            window.onpopstate = function (e) {
                if (!(e.state && e.state.id))
                    return;
                state_1.store.dispatch({ type: 'GIST_CHANGE', gist: e.state.id });
            };
            /* Example gists:
            5b0435641091841a5eacff44946a22c0
            3f7cd9cbe863747a904bba10ce34ee8f
            efc71477cee60916ef71d839084d1afd
            6831799881c92434f80e141c8a2699eb
            */
            ReactDOM.render(React.createElement(react_redux_1.Provider, {store: state_1.store}, React.createElement(App, null)), document.getElementById("app"));
        }
    }
});
//# sourceMappingURL=app.js.map