/// <reference path='../typings/index.d.ts'/>
System.register(['react', 'react-dom', 'react-ga', 'react-redux', './state', './json-viewer', 'servicestack-client', './utils', './SaveAsDialog', './EditGistDialog', './ShortcutsDialog', './InsertLinkDialog', './ImageUploadDialog', './TakeSnapshotDialog', './ConsoleViewerDialog', './InadequateBrowserDialog', './AddServiceStackReferenceDialog', './Console', './Collections', './Editor', './Gistlyn.dtos'], function(exports_1, context_1) {
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
    var React, ReactDOM, react_ga_1, react_redux_1, state_1, json_viewer_1, servicestack_client_1, utils_1, SaveAsDialog_1, EditGistDialog_1, ShortcutsDialog_1, InsertLinkDialog_1, ImageUploadDialog_1, TakeSnapshotDialog_1, ConsoleViewerDialog_1, InadequateBrowserDialog_1, AddServiceStackReferenceDialog_1, Console_1, Collections_1, Editor_1, Gistlyn_dtos_1;
    var ScriptStatusRunning, ScriptStatusError, capturedSnapshot, statusToError, batchLogs, channels, sse, App, qs, activeFileName, stateJson, state, e, qsSnapshot, qsAddRef, qsGist, qsCollection, qsExpression, qsClear;
    function evalExpression(gist, scriptId, expr) {
        if (!expr)
            return;
        var request = new Gistlyn_dtos_1.EvaluateExpression();
        request.scriptId = scriptId;
        request.expression = expr;
        request.includeJson = true;
        react_ga_1.default.event({ category: 'preview', action: 'Evaluate Expression', label: gist + ": " + expr.substring(0, 50) });
        utils_1.client.post(request)
            .then(function (r) {
            if (r.result.errors && r.result.errors.length > 0) {
                r.result.errors.forEach(function (x) {
                    state_1.store.dispatch({ type: 'CONSOLE_LOG', logs: [{ msg: x.info, cls: "error" }] });
                });
            }
            else {
                state_1.store.dispatch({ type: 'EXPRESSION_LOAD', expressionResult: r.result });
            }
        })
            .catch(function (e) {
            var status = e.responseStatus || e; //both have schema `{ message }`
            state_1.store.dispatch({ type: 'CONSOLE_LOG', logs: [statusToError(status)] });
        });
    }
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (react_ga_1_1) {
                react_ga_1 = react_ga_1_1;
            },
            function (react_redux_1_1) {
                react_redux_1 = react_redux_1_1;
            },
            function (state_1_1) {
                state_1 = state_1_1;
            },
            function (json_viewer_1_1) {
                json_viewer_1 = json_viewer_1_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (SaveAsDialog_1_1) {
                SaveAsDialog_1 = SaveAsDialog_1_1;
            },
            function (EditGistDialog_1_1) {
                EditGistDialog_1 = EditGistDialog_1_1;
            },
            function (ShortcutsDialog_1_1) {
                ShortcutsDialog_1 = ShortcutsDialog_1_1;
            },
            function (InsertLinkDialog_1_1) {
                InsertLinkDialog_1 = InsertLinkDialog_1_1;
            },
            function (ImageUploadDialog_1_1) {
                ImageUploadDialog_1 = ImageUploadDialog_1_1;
            },
            function (TakeSnapshotDialog_1_1) {
                TakeSnapshotDialog_1 = TakeSnapshotDialog_1_1;
            },
            function (ConsoleViewerDialog_1_1) {
                ConsoleViewerDialog_1 = ConsoleViewerDialog_1_1;
            },
            function (InadequateBrowserDialog_1_1) {
                InadequateBrowserDialog_1 = InadequateBrowserDialog_1_1;
            },
            function (AddServiceStackReferenceDialog_1_1) {
                AddServiceStackReferenceDialog_1 = AddServiceStackReferenceDialog_1_1;
            },
            function (Console_1_1) {
                Console_1 = Console_1_1;
            },
            function (Collections_1_1) {
                Collections_1 = Collections_1_1;
            },
            function (Editor_1_1) {
                Editor_1 = Editor_1_1;
            },
            function (Gistlyn_dtos_1_1) {
                Gistlyn_dtos_1 = Gistlyn_dtos_1_1;
            }],
        execute: function() {
            ScriptStatusRunning = ["Started", "PrepareToRun", "Running"];
            ScriptStatusError = ["Cancelled", "CompiledWithErrors", "ThrowedException"];
            capturedSnapshot = null;
            react_ga_1.default.initialize("UA-80898009-1");
            if (utils_1.UA.nosse) {
                react_ga_1.default.event({ category: 'error', action: 'load', label: "nosse" });
                ReactDOM.render(React.createElement(InadequateBrowserDialog_1.default, null), document.getElementById("app"));
                throw "This browser does not support Server Sent Events";
            }
            statusToError = function (status) { return ({ errorCode: status.errorCode, msg: status.message, cls: "error" }); };
            batchLogs = new utils_1.BatchItems(30, function (logs) { return state_1.store.dispatch({ type: 'CONSOLE_LOG', logs: logs }); });
            channels = ["gist"];
            sse = new servicestack_client_1.ServerEventsClient("/", channels, {
                handlers: {
                    onConnect: function (activeSub) {
                        state_1.store.dispatch({ type: 'SSE_CONNECT', activeSub: activeSub });
                        react_ga_1.default.set({ userId: activeSub.userId });
                        fetch("/session-to-token", { method: "POST", credentials: "include" });
                    },
                    ConsoleMessage: function (m, e) {
                        batchLogs.queue({ msg: m.message });
                    },
                    ScriptExecutionResult: function (m, e) {
                        if (m.status === state_1.store.getState().scriptStatus)
                            return;
                        if (ScriptStatusError.indexOf(m.status) >= 0 && m.errorResponseStatus) {
                            batchLogs.queue(statusToError(m.errorResponseStatus));
                        }
                        else {
                            batchLogs.queue({ msg: servicestack_client_1.humanize(m.status) });
                        }
                        state_1.store.dispatch({ type: 'SCRIPT_STATUS', scriptStatus: m.status });
                        if (m.status === "CompiledWithErrors" && m.errors) {
                            var errorMsgs = m.errors.map(function (e) { return ({ msg: e.info, cls: "error" }); });
                            errorMsgs.forEach(function (m) { return batchLogs.queue(m); });
                        }
                        else if (m.status === "Completed") {
                            var request = new Gistlyn_dtos_1.GetScriptVariables();
                            var state_2 = state_1.store.getState();
                            request.scriptId = state_2.activeSub.id;
                            utils_1.client.get(request)
                                .then(function (r) {
                                state_1.store.dispatch({ type: "VARS_LOAD", variables: r.variables });
                            });
                            if (state_2.expression) {
                                evalExpression(state_2.gist, state_2.activeSub.id, state_2.expression);
                            }
                        }
                    }
                }
            });
            ;
            App = (function (_super) {
                __extends(App, _super);
                function App() {
                    var _this = this;
                    _super.apply(this, arguments);
                    this.run = function () {
                        var main = _this.getMainFile();
                        if (!main)
                            return;
                        _this.props.clearError();
                        var request = new Gistlyn_dtos_1.RunScript();
                        request.scriptId = _this.scriptId;
                        request.mainSource = main.content;
                        request.packagesConfig = _this.getFileContents(utils_1.FileNames.GistPackages);
                        request.sources = [];
                        for (var k in _this.props.files || []) {
                            if (k.endsWith(".cs") && k.toLowerCase() !== utils_1.FileNames.GistMain)
                                request.sources.push(_this.props.files[k].content);
                        }
                        _this.props.setScriptStatus("Started");
                        react_ga_1.default.event({ category: 'gist', action: 'Run Gist', label: _this.props.gist });
                        utils_1.client.post(request)
                            .then(function (r) {
                            var msgs = r.references.map(function (ref) { return ("loaded " + ref.name); });
                            msgs.push("\n");
                            _this.props.logConsoleMsgs(msgs);
                        })
                            .catch(function (e) {
                            _this.props.raiseError(e.responseStatus || e);
                            _this.props.setScriptStatus("Failed");
                        });
                    };
                    this.cancel = function () {
                        _this.props.clearError();
                        var request = new Gistlyn_dtos_1.CancelScript();
                        request.scriptId = _this.scriptId;
                        react_ga_1.default.event({ category: 'gist', action: 'Cancel Gist', label: _this.props.gist });
                        utils_1.client.post(request)
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
                    return this.getFile(utils_1.FileNames.GistMain);
                };
                Object.defineProperty(App.prototype, "scriptId", {
                    get: function () {
                        return this.props.activeSub && this.props.activeSub.id;
                    },
                    enumerable: true,
                    configurable: true
                });
                App.prototype.save = function () {
                    var meta = this.props.meta;
                    var authUsername = this.getAuthUsername();
                    if (!meta) {
                        this.props.logConsoleError({ message: "There is nothing to save." });
                    }
                    else if (!authUsername) {
                        this.signIn();
                    }
                    else if (meta.owner_login !== authUsername) {
                        this.saveGistAs();
                    }
                    else {
                        this.saveGist();
                    }
                };
                App.prototype.inspectVariable = function (v) {
                    var _this = this;
                    var request = new Gistlyn_dtos_1.GetScriptVariables();
                    request.scriptId = this.scriptId;
                    request.variableName = v.name;
                    react_ga_1.default.event({ category: 'preview', action: 'Inspect Variable', label: this.props.gist + ": " + v.name });
                    utils_1.client.get(request)
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
                            : React.createElement("span", {className: "octicon octicon-triangle-right", style: { margin: "0 10px 0 0", color: "#f7f7f7" }}), React.createElement("a", {onClick: function (e) { return _this.setAndEvaluateExpression(v.name); }}, v.name)), React.createElement("td", {className: "value"}, React.createElement("span", {title: v.value}, v.value)), React.createElement("td", {className: "type"}, React.createElement("span", {title: v.type}, v.type))))];
                    if (varProps) {
                        varProps.forEach(function (p) {
                            rows.push((React.createElement("tr", null, React.createElement("td", {className: "name", style: { padding: "0 0 0 50px" }}, p.canInspect
                                ? React.createElement("a", {onClick: function (e) { return _this.setAndEvaluateExpression(v.name + (p.name[0] != "[" ? "." : "") + p.name); }}, p.name)
                                : React.createElement("span", {style: { color: "#999" }}, p.name)), React.createElement("td", {className: "value"}, React.createElement("span", {title: p.value}, p.value)), React.createElement("td", {className: "type"}, React.createElement("span", {title: p.type}, p.type)))));
                        });
                    }
                    return rows;
                };
                App.prototype.setAndEvaluateExpression = function (expr) {
                    this.props.setExpression(expr);
                    this.evaluateExpression(expr);
                };
                App.prototype.evaluateExpression = function (expr) {
                    if (!expr) {
                        this.props.setExpression(expr);
                    }
                    else {
                        evalExpression(this.props.gist, this.scriptId, expr);
                    }
                };
                App.prototype.clearGistCache = function () {
                    var removeKeys = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var key = localStorage.key(i);
                        if (key.startsWith("/v1/gists/")) {
                            removeKeys.push(key);
                        }
                    }
                    removeKeys.forEach(function (key) { return localStorage.removeItem(key); });
                };
                App.prototype.revertGist = function (shiftKey, ctrlKey) {
                    if (shiftKey === void 0) { shiftKey = false; }
                    if (ctrlKey === void 0) { ctrlKey = false; }
                    localStorage.removeItem(utils_1.GistCacheKey(this.props.gist));
                    react_ga_1.default.event({ category: 'gist', action: 'Revert Gist', label: this.props.gist });
                    var gist = this.props.gist;
                    var resetAll = shiftKey && ctrlKey;
                    if (resetAll) {
                        localStorage.clear();
                        history.replaceState(null, "Gistlyn", "/");
                        gist = utils_1.GistTemplates.NewGist;
                        this.props.reset();
                    }
                    else if (shiftKey) {
                        localStorage.removeItem(utils_1.StateKey);
                    }
                    this.props.changeGist(gist, { reload: true });
                };
                App.prototype.createStoreGist = function (opt) {
                    if (opt === void 0) { opt = {}; }
                    var meta = this.props.meta;
                    var files = this.props.files;
                    if (!meta || !files)
                        return null;
                    var request = new Gistlyn_dtos_1.StoreGist();
                    request.gist = this.props.gist;
                    request.fork = opt.fork || this.shouldFork();
                    request.ownerLogin = opt.ownerLogin || meta.owner_login;
                    request.public = opt.public || meta.public;
                    request.description = opt.description || meta.description;
                    request.files = opt.files || utils_1.toGithubFiles(files);
                    return request;
                };
                App.prototype.saveGist = function (opt) {
                    var _this = this;
                    if (opt === void 0) { opt = {}; }
                    if (this.dialog)
                        this.dialog.classList.add("disabled");
                    var request = this.createStoreGist(opt);
                    if (request == null)
                        return;
                    var done = function () { return _this.dialog && _this.dialog.classList.remove("disabled"); };
                    react_ga_1.default.event({ category: 'gist', action: 'Save Gist', label: this.props.gist });
                    var complete = function (r) {
                        if (_this.props.gist !== r.gist) {
                            _this.props.changeGist(r.gist);
                        }
                        else {
                            _this.props.updateDescription(document.title = request.description);
                        }
                        _this.props.showDialog(null);
                        _this.props.setDirty(false);
                        _this.props.logConsole([{ msg: "[" + servicestack_client_1.timeFmt12() + "] Gist was saved.", cls: "success" }]);
                        done();
                    };
                    utils_1.client.post(request)
                        .then(complete)
                        .catch(function (e) {
                        _this.props.logConsoleError(e.responseStatus || e);
                        if (e.responseStatus && (e.responseStatus.message || "").indexOf("404") >= 0) {
                            request.ownerLogin = null;
                            _this.props.logConsole([{ msg: "[" + servicestack_client_1.timeFmt12() + "] Gist no longer exists. Attempting to Save as new Gist..." }]);
                            utils_1.client.post(request)
                                .then(complete)
                                .catch(function (retryError) {
                                _this.props.logConsoleError(retryError.responseStatus || retryError);
                                done();
                            });
                        }
                        else {
                            done();
                        }
                    });
                };
                App.prototype.handleCreateFile = function (e) {
                    var txt = e.target;
                    if (txt == null)
                        return;
                    txt.disabled = true;
                    this.createFile(txt.value)
                        .then(function (r) { return txt.disabled = false; });
                };
                App.prototype.createFile = function (fileName, opt) {
                    var _this = this;
                    if (opt === void 0) { opt = {}; }
                    var done = function () { return _this.props.editFileName(null); };
                    var request = this.createStoreGist();
                    if (!fileName || fileName.trim().length == 0 || request == null) {
                        done();
                        return Promise.resolve(null);
                    }
                    if (fileName.indexOf('.') === -1)
                        fileName += ".cs";
                    request.files[fileName] = new Gistlyn_dtos_1.GithubFile();
                    request.files[fileName].content = opt.content || "// " + fileName + "\n// Created by " + this.props.activeSub.displayName + " on " + servicestack_client_1.dateFmt() + "\n\n"; //Gist API requires non Whitespace content
                    react_ga_1.default.event({ category: 'file', action: 'Create File', label: fileName });
                    return utils_1.client.post(request)
                        .then(function (r) {
                        _this.props.changeGist(r.gist, { reload: true, activeFileName: fileName });
                    })
                        .catch(function (e) {
                        _this.props.logConsoleError(e.responseStatus || e);
                    });
                };
                App.prototype.handleRenameFile = function (oldFileName, e) {
                    var txt = e.target;
                    if (txt == null)
                        return;
                    txt.disabled = true;
                    this.renameFile(oldFileName, txt.value)
                        .then(function (r) { return txt.disabled = false; });
                };
                App.prototype.renameFile = function (oldFileName, newFileName) {
                    var _this = this;
                    var done = function () { return _this.props.editFileName(null); };
                    var request = this.createStoreGist();
                    if (!newFileName || newFileName.trim().length == 0 || request == null || newFileName === oldFileName) {
                        done();
                        return Promise.resolve(null);
                    }
                    else if (oldFileName === utils_1.FileNames.GistMain || oldFileName === utils_1.FileNames.GistPackages) {
                        done();
                        this.props.logConsoleError({ message: "Cannot rename " + oldFileName });
                        return Promise.resolve(null);
                    }
                    if (newFileName.indexOf('.') === -1)
                        newFileName += ".cs";
                    request.files[oldFileName].filename = newFileName;
                    react_ga_1.default.event({ category: 'file', action: 'Rename File', label: newFileName });
                    return utils_1.client.post(request)
                        .then(function (r) {
                        _this.props.changeGist(r.gist, { reload: true, activeFileName: newFileName });
                    })
                        .catch(function (e) {
                        _this.props.logConsoleError(e.responseStatus || e);
                    });
                };
                App.prototype.deleteFile = function (fileName) {
                    var _this = this;
                    if (!fileName)
                        return;
                    var json = JSON.stringify({ files: (_a = {}, _a[fileName] = null, _a) });
                    react_ga_1.default.event({ category: 'file', action: 'Delete File', label: fileName });
                    fetch("/github-proxy/gists/" + this.props.gist, { method: "PATCH", credentials: "include", body: json })
                        .then(function (res) {
                        _this.props.changeGist(_this.props.gist, { reload: true });
                    })
                        .catch(function (e) {
                        _this.props.logConsoleError(e.responseStatus || e);
                    });
                    var _a;
                };
                App.prototype.deleteGist = function (gist) {
                    var _this = this;
                    if (!gist)
                        return;
                    react_ga_1.default.event({ category: 'gist', action: 'Delete Gist', label: gist });
                    fetch("/github-proxy/gists/" + this.props.gist, { method: "DELETE", credentials: "include" })
                        .then(function (res) {
                        _this.props.removeGistStat(gist);
                        _this.props.changeGist(utils_1.GistTemplates.NewGist, { reload: true });
                    })
                        .catch(function (e) {
                        _this.props.logConsoleError(e.responseStatus || e);
                    });
                };
                App.prototype.saveGistAs = function () {
                    react_ga_1.default.event({ category: 'gist', action: 'Save As', label: this.props.gist });
                    this.props.showDialog("save-as");
                };
                App.prototype.signIn = function () {
                    react_ga_1.default.event({ category: 'user', action: 'Sign In', label: this.props.gist });
                    location.href = '/auth/github';
                };
                App.prototype.componentDidUpdate = function () {
                    window.onkeydown = this.handleWindowKeyDown.bind(this);
                };
                App.prototype.showPopup = function (e, el) {
                    if (el === this.lastPopup)
                        return;
                    react_ga_1.default.event({ category: 'app', action: 'Show Popup', label: el.id });
                    e.stopPropagation();
                    this.lastPopup = el;
                    el.style.display = "block";
                };
                App.prototype.handleBodyClick = function (e) {
                    if (this.lastPopup != null) {
                        this.lastPopup.style.display = "none";
                        this.lastPopup = null;
                    }
                };
                App.prototype.handleWindowKeyDown = function (e) {
                    var target = e.target;
                    if (target.tagName === "TEXTAREA" || target.tagName === "INPUT")
                        return;
                    if (e.ctrlKey) {
                        if (e.keyCode === 37 || e.keyCode === 39) {
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
                        else if (e.keyCode == 13) {
                            this.onShortcut("Ctrl-Enter");
                        }
                        else if (e.key && ["s"].indexOf(e.key) >= 0) {
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
                };
                App.prototype.onShortcut = function (pattern) {
                    switch (pattern) {
                        case "Esc":
                            this.props.showDialog(null);
                            break;
                        case "Ctrl-Enter":
                            var scriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;
                            if (!scriptRunning)
                                this.run();
                            else
                                this.cancel();
                            break;
                        case "Ctrl-S":
                            this.save();
                            break;
                        case "Alt-S":
                            capturedSnapshot = state_1.store.getState();
                            this.props.showDialog("take-snapshot");
                            break;
                        case "Alt-C":
                            capturedSnapshot = state_1.store.getState();
                            this.props.showDialog("console-viewer");
                            break;
                    }
                };
                App.prototype.handleAddReference = function (baseUrl, fileName, content, requestDto, autorun) {
                    var _this = this;
                    var main = this.getMainFile();
                    if (!main)
                        return;
                    if (main.content.indexOf("{BaseUrl}") >= 0) {
                        var updated = main.content.replace("{BaseUrl}", baseUrl)
                            .replace("{Domain}", servicestack_client_1.splitOnFirst(baseUrl.split("://")[1], "/")[0])
                            .replace("RequestDto", requestDto);
                        this.props.updateSource(utils_1.FileNames.GistMain, updated);
                    }
                    var packagesConfig = this.getFileContents(utils_1.FileNames.GistPackages);
                    if (packagesConfig) {
                        this.props.updateSource(utils_1.FileNames.GistPackages, utils_1.addClientPackages(packagesConfig));
                    }
                    this.props.addFile(fileName, content);
                    if (autorun) {
                        this.props.selectFileName(utils_1.FileNames.GistMain); // Show what's running
                        setTimeout(function () { return _this.run(); }, 0);
                    }
                    this.props.showDialog(null);
                };
                App.prototype.getAuthUsername = function () {
                    var activeSub = this.props.activeSub;
                    return activeSub && parseInt(activeSub.userId) > 0 ? activeSub.displayName : null;
                };
                App.prototype.shouldFork = function () {
                    var authUsername = this.getAuthUsername();
                    var meta = this.props.meta;
                    return authUsername != null
                        && meta != null
                        && meta.public
                        && authUsername != meta.owner_login
                        && utils_1.GistTemplates.Gists.indexOf(this.props.gist) === -1;
                };
                App.prototype.render = function () {
                    var _this = this;
                    var MorePopup = [];
                    var EditorPopup = [];
                    var activeSub = this.props.activeSub;
                    var authUsername = this.getAuthUsername();
                    var meta = this.props.meta;
                    var shouldFork = this.shouldFork();
                    var files = this.props.files;
                    var description = meta != null ? meta.description : null;
                    var main = this.getMainFile();
                    var collection = this.props.collection;
                    var isGistCollection = this.getFile(utils_1.FileNames.CollectionIndex) != null;
                    var isScript = main != null;
                    var isScriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;
                    var isGistOwner = authUsername && meta && meta.owner_login === authUsername;
                    var isCollectionOwner = authUsername && collection && collection.owner_login === authUsername;
                    var Preview = [];
                    var showCollection = this.props.showCollection && collection && collection.html != null;
                    if (showCollection) {
                        Preview.push(React.createElement(Collections_1.default, {collection: collection, isOwner: isCollectionOwner, gistStats: this.props.gistStats, excludeGists: utils_1.GistTemplates.Gists, showLiveLists: collection.id === utils_1.GistTemplates.HomeCollection, authUsername: authUsername, onHome: function (e) { return _this.props.urlChanged(utils_1.GistTemplates.HomeCollection); }, changeGist: function (id, options) { return _this.props.changeGist(id, options); }, changeCollection: function (id, reload) { return _this.props.changeCollection(id, reload); }, viewSnapshot: function (id) { return _this.props.urlChanged(id); }}));
                    }
                    else if (this.props.showCollection) {
                        Preview.push((React.createElement("div", {id: "collection", className: "section"}, React.createElement("div", {id: "collection-header"}, "Collection"), React.createElement("div", {id: "collection-body"}, React.createElement("div", {id: "markdown"}, React.createElement("div", {style: { color: "#444", fontSize: 20, position: "absolute", top: "50%", margin: "-55px 0 0 0", textAlign: "center", width: "100%" }}, React.createElement("img", {src: "/img/ajax-loader.gif", style: { margin: "5px 10px 0 0" }}), "loading..."))))));
                    }
                    else if (this.props.error != null) {
                        var code = this.props.error.errorCode ? "(" + this.props.error.errorCode + ") " : "";
                        Preview.push((React.createElement("div", {id: "errors", className: "section"}, React.createElement("div", {style: { margin: "25px 25px 40px 25px", color: "#a94442" }}, code, this.props.error.message), this.props.error.stackTrace != null
                            ? React.createElement("pre", {style: { color: "red", padding: "5px 30px" }}, this.props.error.stackTrace)
                            : null, React.createElement("span", {className: "lnk", style: { paddingLeft: 25 }, onClick: function (e) { return _this.props.urlChanged(utils_1.GistTemplates.HomeCollection); }}, "Home"))));
                    }
                    else if (isScriptRunning) {
                        Preview.push((React.createElement("div", {id: "status", className: "section"}, React.createElement("div", {style: { margin: '40px', color: "#444", width: "215px" }, title: "executing..."}, React.createElement("img", {src: "/img/ajax-loader.gif", style: { float: "right", margin: "5px 0 0 0" }}), React.createElement("i", {className: "material-icons", style: { position: "absolute" }}, "build"), React.createElement("p", {style: { padding: "0 0 0 30px", fontSize: "22px" }}, "Executing Script"), React.createElement("div", {id: "splash", style: { padding: "20px 0 0 0" }}, React.createElement("img", {src: "/img/compiling.png"}))))));
                    }
                    else if (this.props.variables.length > 0) {
                        var vars = this.props.variables;
                        var exprResult = this.props.expressionResult;
                        var exprVar = exprResult != null && exprResult.variables.length > 0 ? exprResult.variables[0] : null;
                        Preview.push((React.createElement("div", {id: "vars", className: "section", style: { display: "flex", flexFlow: "column", overflow: "hidden" }}, React.createElement("table", {style: { width: "100%", flex: 1 }}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {className: "name"}, "name"), React.createElement("th", {className: "value"}, "value"), React.createElement("th", {className: "type"}, "type "))), React.createElement("tbody", null, vars.map(function (v) { return _this.getVariableRows(v); }), React.createElement("tr", null, React.createElement("td", {colSpan: 3}, React.createElement("input", {id: "txtEval", type: "text", placeholder: "Evaluate Expression", value: this.props.expression, onChange: function (e) { return _this.props.setExpression(e.target.value); }, onKeyPress: function (e) { return e.which === 13 ? _this.evaluateExpression(_this.props.expression) : null; }, autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: "false"}), React.createElement("i", {id: "btnEval", className: "material-icons noselect", title: "run", onClick: function (e) { return _this.evaluateExpression(_this.props.expression); }}, "play_arrow"))))), React.createElement("div", {id: "evaluate", style: { overflow: "auto" }}, exprVar
                            ? (React.createElement("div", {id: "expression-result"}, React.createElement(json_viewer_1.JsonViewer, {json: exprVar.json})))
                            : null))));
                    }
                    else {
                        Preview.push(React.createElement("div", {id: "placeholder"}));
                    }
                    if (this.props.logs.length > 0 && !this.props.showCollection) {
                        Preview.push(React.createElement(Console_1.default, {logs: this.props.logs, onClear: function () { return _this.props.clearConsole(); }, showDialog: this.props.showDialog}));
                    }
                    MorePopup.push((React.createElement("div", {onClick: function (e) { return _this.props.urlChanged(utils_1.GistTemplates.HomeCollection); }}, "Home")));
                    MorePopup.push((React.createElement("div", {onClick: function (e) { return _this.props.changeGist(utils_1.GistTemplates.NewGist); }}, "New Gist")));
                    MorePopup.push((React.createElement("div", {onClick: function (e) { return _this.props.changeGist(utils_1.GistTemplates.NewPrivateGist); }}, "New Private Gist")));
                    MorePopup.push((React.createElement("div", {onClick: function (e) { return _this.props.changeGist(utils_1.GistTemplates.NewCollection); }}, "New Collection")));
                    MorePopup.push((React.createElement("div", {onClick: function (e) { return _this.props.showDialog("shortcuts"); }}, "Shortcuts")));
                    MorePopup.push((React.createElement("div", {onClick: function (e) { return _this.clearGistCache(); }}, "Clear Gist Caches")));
                    MorePopup.push((React.createElement("div", {onClick: function (e) { return window.open("https://github.com/ServiceStack/Gistlyn/issues"); }}, "Send Feedback")));
                    EditorPopup.push((React.createElement("div", null, React.createElement("a", {href: "https://gist.github.com/" + this.props.gist, target: "_blank"}, "View on Github"))));
                    if (authUsername) {
                        EditorPopup.push((React.createElement("div", {onClick: function (e) { return _this.props.showDialog("edit-gist"); }}, "Edit Gist")));
                    }
                    EditorPopup.push((React.createElement("div", {onClick: function (e) { return _this.props.showDialog("add-ss-ref"); }}, "Add ServiceStack Reference")));
                    var toggleEdit = function () {
                        var inputWasHidden = _this.txtUrl.style.display !== "inline-block";
                        var showInput = !meta || !description || inputWasHidden;
                        _this.txtUrl.style.display = showInput ? "inline-block" : "none";
                        document.getElementById("desc-overlay").style.display = showInput ? "none" : "inline-block";
                        if (inputWasHidden) {
                            _this.txtUrl.focus();
                            _this.txtUrl.select();
                        }
                    };
                    var showGistInput = !meta || !description || (this.txtUrl && this.txtUrl == document.activeElement);
                    var goHome = function () { return _this.props.urlChanged(utils_1.GistTemplates.HomeCollection); };
                    return (React.createElement("div", {id: "body", onClick: function (e) { return _this.handleBodyClick(e); }, className: utils_1.UA.getClassList()}, React.createElement("div", {className: "titlebar"}, React.createElement("div", {className: "container"}, React.createElement("img", {id: "logo", src: "img/logo-32-inverted.png", alt: "ServiceStack logo", onClick: goHome, style: { cursor: "pointer" }}), React.createElement("h3", {title: "Home", onClick: goHome, style: { cursor: "pointer" }}, "Gistlyn"), " ", React.createElement("sup", {style: { padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}, "BETA"), React.createElement("div", {id: "gist"}, meta
                        ? React.createElement("img", {src: meta.owner_avatar_url, title: meta.owner_login, style: { verticalAlign: "bottom", margin: "0 5px 2px 0" }})
                        : React.createElement("span", {className: "octicon octicon-logo-gist", style: { verticalAlign: "bottom", margin: "0 6px 6px 0" }}), React.createElement("input", {ref: function (e) { return _this.txtUrl = e; }, type: "text", id: "txtUrl", placeholder: "gist hash or url", style: { display: showGistInput ? "inline-block" : "none" }, onBlur: toggleEdit, value: this.props.url, onFocus: function (e) { return e.target.select(); }, onChange: function (e) { return _this.props.urlChanged(e.target.value); }, autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: "false"}), React.createElement("div", {id: "desc-overlay", style: { display: showGistInput ? "none" : "inline-block" }, onClick: toggleEdit}, React.createElement("div", {className: "inner"}, React.createElement("h2", null, description), meta && !meta.public
                        ? (React.createElement("span", {style: { margin: "3px 0px 3px -40px", fontSize: 12, background: "#ffefc6", color: "#888", padding: "2px 4px", borderRadius: 3 }, title: "This gist is private"}, "secret"))
                        : null, React.createElement("i", {className: "material-icons"}, "close"))), this.props.error
                        ? React.createElement("i", {className: "material-icons", style: { color: "#FF5252", fontSize: 26, position: "absolute", margin: "2px 0 0 7px", background: "#f1f1f1", borderRadius: 14 }}, "error")
                        : main != null
                            ? React.createElement("i", {className: "material-icons", style: { color: "#0f9", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}, "check")
                            : null, React.createElement("i", {id: "btnCollections", style: { visibility: meta ? "visible" : "hidden" }, title: "Collections", onClick: function (e) { return _this.props.changeCollection((collection && collection.id) || utils_1.GistTemplates.HomeCollection, !showCollection); }, className: "material-icons" + (showCollection ? " active" : "")}, "apps")), !authUsername
                        ? (React.createElement("div", {id: "sign-in", style: { position: "absolute", right: 5, top: 4 }}, React.createElement("a", {href: "/auth/github", style: { color: "#fff", textDecoration: "none" }}, React.createElement("span", {style: { whiteSpace: "nowrap", fontSize: 14 }}, "Sign-in"), React.createElement("span", {style: { verticalAlign: "sub", margin: "0 0 0 10px" }, className: "mega-octicon octicon-mark-github", title: "Sign in with GitHub"}))))
                        : ([
                            React.createElement("div", {id: "signed-in", style: { position: "absolute", right: 5, cursor: "pointer" }, onClick: function (e) { return _this.showPopup(e, _this.userPopup); }}, React.createElement("span", {style: { whiteSpace: "nowrap", fontSize: 14 }}, activeSub.displayName), React.createElement("img", {src: activeSub.profileUrl, style: { verticalAlign: "middle", marginLeft: 5, borderRadius: "50%" }})),
                            React.createElement("div", {id: "popup-user", className: "popup", ref: function (e) { return _this.userPopup = e; }}, React.createElement("div", {onClick: function (e) { return location.href = "/auth/logout"; }}, "Sign out"))
                        ]))), React.createElement("div", {id: "content"}, React.createElement("div", {id: "ide"}, React.createElement("div", {id: "editor-menu"}, React.createElement("i", {className: "material-icons noselect", onClick: function (e) { return _this.showPopup(e, _this.editorPopup); }}, "more_vert")), React.createElement("div", {id: "popup-editor", className: "popup", ref: function (e) { return _this.editorPopup = e; }}, EditorPopup), React.createElement(Editor_1.default, {ref: function (e) { return _this.editor = e; }, files: files, isOwner: isGistOwner, activeFileName: this.props.activeFileName, editingFileName: this.props.editingFileName, selectFileName: function (fileName) { return _this.props.selectFileName(fileName); }, editFileName: function (fileName) { return _this.props.editFileName(fileName); }, showPopup: function (e, filesPopup) { return _this.showPopup(e, filesPopup); }, showDialog: function (dialog) { return _this.props.showDialog(dialog); }, updateSource: function (fileName, src) { return _this.props.updateSource(fileName, src); }, onRenameFile: function (fileName, e) { return _this.handleRenameFile(fileName, e); }, onCreateFile: function (e) { return _this.handleCreateFile(e); }, onDeleteFile: function (fileName) { return _this.deleteFile(fileName); }, onShortcut: function (keyPattern) { return _this.onShortcut(keyPattern); }}), React.createElement("div", {id: "preview"}, Preview))), React.createElement("div", {id: "footer-spacer"}), React.createElement("div", {id: "footer"}, React.createElement("div", {id: "actions", style: { visibility: meta ? "visible" : "hidden" }, className: "noselect"}, React.createElement("div", {id: "revert", onClick: function (e) { return _this.revertGist(e.shiftKey, e.ctrlKey); }}, React.createElement("i", {className: "material-icons"}, "undo"), React.createElement("p", null, "Revert Changes")), meta && meta.owner_login == authUsername
                        ? (React.createElement("div", {id: "save", onClick: function (e) { return _this.saveGist(); }, className: this.props.dirty ? "" : "disabled"}, React.createElement("i", {className: "material-icons"}, "save"), React.createElement("p", null, "Save Gist")))
                        : (React.createElement("div", {id: "saveas", onClick: function (e) { return authUsername ? _this.saveGistAs() : _this.signIn(); }, title: !authUsername ? "Sign-in to save gists" : "Save a copy in your Github gists"}, React.createElement("span", {className: "octicon octicon-repo-forked", style: { margin: "3px 3px 0 0" }}), React.createElement("p", null, authUsername ? (shouldFork ? "Fork As" : "Save As") : "Sign-in to save"))), meta && meta.owner_login === authUsername
                        ? (React.createElement("div", {id: "delete-file", onClick: function (e) { return confirm("Are you sure you want to delete gist '" + meta.description + "'?") ? _this.deleteGist(_this.props.gist) : null; }}, React.createElement("i", {className: "material-icons"}, "delete_forever"), React.createElement("p", null, "Delete Gist")))
                        : null), authUsername ? (React.createElement("i", {id: "btnSnapshot", className: "lnk material-icons", title: "Take Snapshot", onClick: function (e) {
                        return (capturedSnapshot = state_1.store.getState()) && _this.props.showDialog("take-snapshot");
                    }}, "camera_alt")) : null, React.createElement("span", {id: "btnConsole", className: "lnk mega-octicon octicon-terminal", title: "Console Viewer", onClick: function (e) { return _this.props.showDialog("console-viewer"); }}), React.createElement("div", {id: "more-menu", style: { position: "absolute", right: 5, bottom: 5, color: "#fff", cursor: "pointer" }}, React.createElement("i", {className: "material-icons", onClick: function (e) { return _this.showPopup(e, _this.morePopup); }}, "more_vert")), React.createElement("div", {id: "popup-more", className: "popup", ref: function (e) { return _this.morePopup = e; }, style: { position: "absolute", bottom: 42, right: 0 }}, MorePopup)), React.createElement("div", {id: "run", className: "noselect"}, main != null
                        ? (!isScriptRunning
                            ? React.createElement("i", {onClick: function (e) { return _this.run(); }, className: "material-icons", title: "run"}, "play_circle_outline")
                            : React.createElement("i", {onClick: function (e) { return _this.cancel(); }, className: "material-icons", title: "cancel script", style: { color: "#FF5252" }}, "cancel"))
                        : null, isGistCollection && isGistOwner && (this.props.gist != (collection && collection.id) || !showCollection)
                        ? (React.createElement("i", {onClick: function (e) { return _this.props.changeCollection(_this.props.gist, true); }, className: "material-icons owner", title: "View Collection"}, "chevron_right"))
                        : null, showCollection && isCollectionOwner && this.props.gist != collection.id
                        ? (React.createElement("i", {onClick: function (e) { return _this.props.changeGist(collection.id); }, className: "material-icons owner", title: "Edit Collection"}, "chevron_left"))
                        : null), meta && this.props.dialog === "save-as"
                        ? React.createElement(SaveAsDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, description: description, isPublic: meta.public, shouldFork: shouldFork, onSave: function (opt) { return _this.saveGist(opt); }, onHide: function () { return _this.props.showDialog(null); }})
                        : null, meta && this.props.dialog === "edit-gist"
                        ? React.createElement(EditGistDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, description: description, onSave: function (opt) { return _this.saveGist(opt); }, onHide: function () { return _this.props.showDialog(null); }})
                        : null, meta && this.props.dialog === "shortcuts"
                        ? React.createElement(ShortcutsDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, onHide: function () { return _this.props.showDialog(null); }})
                        : null, meta && this.props.dialog === "console-viewer"
                        ? React.createElement(ConsoleViewerDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, onHide: function () { return _this.props.showDialog(null); }, logs: this.props.logs, onClear: function () { return _this.props.clearConsole() && _this.props.showDialog(null); }})
                        : null, meta && this.props.dialog === "add-ss-ref"
                        ? React.createElement(AddServiceStackReferenceDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, onHide: function () { return _this.props.showDialog(null); }, onAddReference: this.handleAddReference.bind(this), urlChanged: function (url) { return _this.props.urlChanged(url) && _this.props.showDialog(null); }})
                        : null, capturedSnapshot && this.props.dialog === "take-snapshot"
                        ? React.createElement(TakeSnapshotDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, description: "Snapshot " + servicestack_client_1.timeFmt12(), snapshot: Object.assign({}, capturedSnapshot, { activeSub: null }), onHide: function () { return _this.props.showDialog(null) && (capturedSnapshot = null); }, urlChanged: function (url) { return _this.props.urlChanged(url) && _this.props.showDialog(null); }})
                        : null, meta && this.props.dialog === "img-upload"
                        ? React.createElement(ImageUploadDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, onHide: function () { return _this.props.showDialog(null); }, id: this.props.gist, onChange: function (url) { return _this.editor.replaceSelection("![{selection}](" + url + ")\n"); }})
                        : null, meta && this.props.dialog === "insert-link"
                        ? React.createElement(InsertLinkDialog_1.default, {dialogRef: function (e) { return _this.dialog = e; }, onHide: function () { return _this.props.showDialog(null); }, linkLabel: this.editor ? this.editor.getSelection() : "", gistStats: this.props.gistStats, authUsername: authUsername, onChange: function (url, label) { return _this.props.showDialog(null) && _this.editor.replaceSelection("[" + label + "](" + url + ")"); }})
                        : null, React.createElement("div", {id: "sig"}, "made with ", React.createElement("span", null, String.fromCharCode(10084)), " by ", React.createElement("a", {target: "_blank", href: "https://servicestack.net"}, "ServiceStack"))));
                };
                App = __decorate([
                    utils_1.reduxify(function (state) { return ({
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
                    }); }, function (dispatch) { return ({
                        reset: function () { return dispatch({ type: 'RESET' }); },
                        urlChanged: function (url) { return dispatch({ type: 'URL_CHANGE', url: url }); },
                        changeGist: function (gist, options) {
                            if (options === void 0) { options = {}; }
                            return dispatch({ type: 'GIST_CHANGE', gist: gist, options: options });
                        },
                        updateDescription: function (description) { return dispatch({ type: 'META_UPDATE', description: description }); },
                        updateSource: function (fileName, content) { return dispatch({ type: 'SOURCE_CHANGE', fileName: fileName, content: content }); },
                        addFile: function (fileName, content) { return dispatch({ type: 'FILE_ADD', fileName: fileName, file: { fileName: fileName, content: content } }); },
                        selectFileName: function (activeFileName) { return dispatch({ type: 'FILE_SELECT', activeFileName: activeFileName }); },
                        editFileName: function (fileName) { return dispatch({ type: 'FILENAME_EDIT', fileName: fileName }); },
                        raiseError: function (error) { return dispatch({ type: 'ERROR_RAISE', error: error }); },
                        clearError: function () { return dispatch({ type: 'ERROR_CLEAR' }); },
                        clearConsole: function () { return dispatch({ type: 'CONSOLE_CLEAR' }); },
                        logConsole: function (logs) { return dispatch({ type: 'CONSOLE_LOG', logs: logs }); },
                        logConsoleError: function (status) { return dispatch({ type: 'CONSOLE_LOG', logs: [Object.assign({ msg: status.message, cls: "error" }, status)] }); },
                        logConsoleMsgs: function (txtMessages) { return dispatch({ type: 'CONSOLE_LOG', logs: txtMessages.map(function (msg) { return ({ msg: msg }); }) }); },
                        setScriptStatus: function (scriptStatus) { return dispatch({ type: 'SCRIPT_STATUS', scriptStatus: scriptStatus }); },
                        inspectVariable: function (name, variables) { return dispatch({ type: 'VARS_INSPECT', name: name, variables: variables }); },
                        setExpression: function (expression) { return dispatch({ type: 'EXPRESSION_SET', expression: expression }); },
                        showDialog: function (dialog) { return dispatch({ type: 'DIALOG_SHOW', dialog: dialog }); },
                        setDirty: function (dirty) { return dispatch({ type: 'DIRTY_SET', dirty: dirty }); },
                        changeCollection: function (id, showCollection) { return dispatch({ type: 'COLLECTION_CHANGE', collection: { id: id }, showCollection: showCollection }); },
                        removeGistStat: function (gist) { return dispatch({ type: "GISTSTAT_REMOVE", gist: gist }); }
                    }); })
                ], App);
                return App;
            }(React.Component));
            qs = servicestack_client_1.queryString(location.href);
            activeFileName = qs["activeFileName"];
            stateJson = localStorage.getItem(utils_1.StateKey);
            state = null;
            if (stateJson) {
                try {
                    state = JSON.parse(stateJson);
                    if (activeFileName) {
                        state.activeFileName = activeFileName;
                    }
                    state_1.store.dispatch({ type: "LOAD", state: state });
                    if (!qs["gist"] && state.gist != null && !(state.files || state.meta)) {
                        state_1.store.dispatch({ type: "GIST_CHANGE", gist: state.gist, options: { activeFileName: activeFileName } });
                    }
                }
                catch (e) {
                    console.log("ERROR loading state:", e, stateJson);
                    localStorage.removeItem(utils_1.StateKey);
                }
            }
            qsSnapshot = qs["snapshot"];
            if (qsSnapshot) {
                state_1.store.dispatch({ type: "URL_CHANGE", url: qsSnapshot });
            }
            qsAddRef = qs["AddServiceStackReference"];
            if (qsAddRef) {
                state_1.store.dispatch({ type: "GIST_CHANGE", gist: utils_1.GistTemplates.AddServiceStackReferenceGist });
                state_1.store.dispatch({ type: "DIALOG_SHOW", dialog: "add-ss-ref" });
            }
            else {
                qsGist = qs["gist"] || utils_1.GistTemplates.NewGist;
                if (qsGist != (state && state.gist) || (state && !state.meta)) {
                    state_1.store.dispatch({ type: "GIST_CHANGE", gist: qsGist, options: { activeFileName: activeFileName } });
                }
            }
            qsCollection = qs["collection"];
            if (qsCollection) {
                state_1.store.dispatch({
                    type: "COLLECTION_CHANGE",
                    collection: { id: qsCollection },
                    showCollection: (state && state.showCollection) || qsCollection != (state && state.collection && state.collection.id)
                });
            }
            else if (!state) {
                state_1.store.dispatch({ type: "COLLECTION_CHANGE", collection: { id: utils_1.GistTemplates.HomeCollection }, showCollection: true });
            }
            qsExpression = qs["expression"];
            if (qsExpression) {
                state_1.store.dispatch({ type: "EXPRESSION_SET", expression: qsExpression });
            }
            qsClear = qs["clear"];
            if (qsClear === "state") {
                localStorage.removeItem(utils_1.StateKey);
            }
            else if (qsClear === "all") {
                localStorage.clear();
            }
            window.onpopstate = function (e) {
                if (!e.state)
                    return;
                if (e.state.gist)
                    state_1.store.dispatch({ type: "GIST_CHANGE", gist: e.state.gist });
                if (e.state.collection)
                    state_1.store.dispatch({ type: "COLLECTION_CHANGE", collection: { id: e.state.collection }, showCollection: true });
            };
            ReactDOM.render(React.createElement(react_redux_1.Provider, {store: state_1.store}, React.createElement(App, null)), document.getElementById("app"));
        }
    }
});
//# sourceMappingURL=app.js.map