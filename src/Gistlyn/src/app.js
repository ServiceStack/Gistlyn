// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/browser.d.ts'/>
System.register(['react-dom', 'react', 'redux', 'react-redux', './utils', 'react-codemirror', "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js", "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js", "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js", "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js", "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js", "./codemirror.js"], function(exports_1, context_1) {
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
    var ReactDOM, React, redux_1, react_redux_1, utils_1, react_codemirror_1;
    var options, updateGist, store, App, gist;
    function reduxify(mapStateToProps, mapDispatchToProps, mergeProps, options) {
        return function (target) { return (react_redux_1.connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target)); };
    }
    return {
        setters:[
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (React_1) {
                React = React_1;
            },
            function (redux_1_1) {
                redux_1 = redux_1_1;
            },
            function (react_redux_1_1) {
                react_redux_1 = react_redux_1_1;
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
            function (_6) {}],
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
            updateGist = function (store) { return function (next) { return function (action) {
                var result = next(action);
                if (action.type === 'GIST_CHANGE') {
                    fetch("https://api.github.com/gists/" + gist)
                        .then(function (res) { return res.json().then(function (r) {
                        //console.log('loading files...', r.files);
                        store.dispatch({ type: 'GIST_LOAD', files: r.files });
                    }); });
                }
                return result;
            }; }; };
            store = redux_1.createStore(function (state, action) {
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
            }, { gist: null, files: {}, activeFile: null }, redux_1.applyMiddleware(updateGist));
            App = (function (_super) {
                __extends(App, _super);
                function App() {
                    _super.apply(this, arguments);
                }
                App.prototype.render = function () {
                    var _this = this;
                    var handleGistUpdate = function (e) {
                        var target = e.target;
                        var gist = target.value;
                        _this.props.updateGist(gist);
                    };
                    var keys = Object.keys(this.props.files);
                    keys.sort(function (a, b) {
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
                    var source = "";
                    var Tabs = [];
                    keys.forEach(function (k) {
                        var file = _this.props.files[k];
                        var active = k === _this.props.activeFile ||
                            (_this.props.activeFile == null && k.toLowerCase() === "main.cs");
                        Tabs.push((React.createElement("div", {className: active ? 'active' : null, onClick: function (e) { return _this.props.changeTab(file.filename); }}, React.createElement("b", null, file.filename))));
                        if (active) {
                            source = file.content;
                            options["mode"] = file.filename.endsWith('.config')
                                ? "application/xml"
                                : "text/x-csharp";
                        }
                    });
                    return (React.createElement("div", {id: "body"}, React.createElement("div", {className: "titlebar"}, React.createElement("div", {className: "container"}, React.createElement("img", {id: "logo", src: "img/logo-32-inverted.png"}), React.createElement("h3", null, "Gistlyn"), " ", React.createElement("sup", {style: { padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}, "BETA"), React.createElement("div", {id: "gist"}, React.createElement("input", {type: "text", id: "txtGist", placeholder: "gist hash or url", value: this.props.gist, onChange: function (e) { return handleGistUpdate(e); }})))), React.createElement("div", {id: "content"}, React.createElement("div", {id: "ide"}, React.createElement("div", {className: "editor"}, React.createElement("div", {id: "tabs"}, Tabs), React.createElement(react_codemirror_1.default, {value: source, options: options})), React.createElement("div", {className: "preview"}, "preview"))), React.createElement("div", {id: "footer"})));
                };
                App = __decorate([
                    reduxify(function (state) { return ({
                        gist: state.gist,
                        files: state.files,
                        activeFile: state.activeFile
                    }); }, function (dispatch) { return ({
                        updateGist: function (gist) { return dispatch({ type: 'GIST_CHANGE', gist: gist }); },
                        changeTab: function (activeFile) { return dispatch({ type: 'FILE_CHANGE', activeFile: activeFile }); }
                    }); })
                ], App);
                return App;
            }(React.Component));
            gist = utils_1.queryString(location.href)["gist"] || "6831799881c92434f80e141c8a2699eb";
            store.dispatch({ type: 'GIST_CHANGE', gist: gist });
            ReactDOM.render(React.createElement(react_redux_1.Provider, {store: store}, React.createElement(App, null)), document.getElementById("app"));
        }
    }
});
//# sourceMappingURL=app.js.map