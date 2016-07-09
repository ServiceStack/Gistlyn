System.register(['redux', './utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var redux_1, utils_1;
    var StateKey, GistCacheKey, updateGist, defaults, store;
    return {
        setters:[
            function (redux_1_1) {
                redux_1 = redux_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            StateKey = "/v1/state";
            GistCacheKey = function (gist) { return ("/v1/gists/" + gist); };
            updateGist = function (store) { return function (next) { return function (action) {
                var oldGist = store.getState().gist;
                var result = next(action);
                var state = store.getState();
                if (action.type !== "LOAD") {
                    localStorage.setItem(StateKey, JSON.stringify(state));
                }
                if (action.type === 'GIST_CHANGE' && action.gist && (action.reload || oldGist !== action.gist)) {
                    var json = localStorage.getItem(GistCacheKey(state.gist));
                    if (json) {
                        var gist = JSON.parse(json);
                        var meta = gist.meta;
                        var files = gist.files;
                        document.title = meta && meta.description;
                        store.dispatch({ type: 'GIST_LOAD', meta: meta, files: files, activeFileName: utils_1.getSortedFileNames(files)[0] });
                    }
                    else {
                        fetch("https://api.github.com/gists/" + action.gist)
                            .then(function (res) {
                            if (!res.ok) {
                                throw res;
                            }
                            else {
                                return res.json().then(function (r) {
                                    var meta = {
                                        id: r.id,
                                        description: r.description,
                                        public: r.public,
                                        created_at: r.created_at,
                                        updated_at: r.updated_at,
                                        owner_login: r.owner && r.owner.login,
                                        owner_id: r.owner && r.owner.id,
                                        owner_avatar_url: r.owner && r.owner.avatar_url
                                    };
                                    document.title = meta.description;
                                    localStorage.setItem(GistCacheKey(state.gist), JSON.stringify({ files: r.files, meta: meta }));
                                    store.dispatch({ type: 'GIST_LOAD', meta: meta, files: r.files, activeFileName: utils_1.getSortedFileNames(r.files)[0] });
                                });
                            }
                        })
                            .catch(function (res) {
                            store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: "Gist with hash '" + action.gist + "' was " + res.statusText } });
                        });
                    }
                }
                else if (action.type === "SOURCE_CHANGE") {
                    localStorage.setItem(GistCacheKey(state.gist), JSON.stringify({ files: state.files, meta: state.meta }));
                }
                return result;
            }; }; };
            defaults = {
                gist: null,
                activeSub: null,
                meta: null,
                files: null,
                activeFileName: null,
                hasLoaded: false,
                error: null,
                scriptStatus: null,
                logs: [],
                variables: [],
                inspectedVariables: {},
                expression: null,
                expressionResult: null
            };
            exports_1("store", store = redux_1.createStore(function (state, action) {
                switch (action.type) {
                    case 'LOAD':
                        return action.state;
                    case 'SSE_CONNECT':
                        return Object.assign({}, state, { activeSub: action.activeSub });
                    case 'GIST_CHANGE':
                        return Object.assign({}, defaults, { activeSub: state.activeSub }, { gist: action.gist });
                    case 'GIST_LOAD':
                        return Object.assign({}, state, { meta: action.meta, files: action.files, activeFileName: action.activeFileName, variables: [], logs: [], hasLoaded: true });
                    case 'FILE_SELECT':
                        return Object.assign({}, state, { activeFileName: action.activeFileName });
                    case 'ERROR_RAISE':
                        return Object.assign({}, state, { error: action.error });
                    case 'CONSOLE_LOG':
                        return Object.assign({}, state, { logs: state.logs.concat(action.logs) });
                    case 'CONSOLE_CLEAR':
                        return Object.assign({}, state, { logs: [{ msg: "" }] });
                    case 'SCRIPT_STATUS':
                        return Object.assign({}, state, { scriptStatus: action.scriptStatus });
                    case 'SOURCE_CHANGE':
                        var file = Object.assign({}, state.files[action.fileName], { content: action.content });
                        return Object.assign({}, state, { files: Object.assign({}, state.files, (_a = {}, _a[action.fileName] = file, _a)) });
                    case 'VARS_LOAD':
                        return Object.assign({}, state, { variables: action.variables, inspectedVariables: {} });
                    case 'VARS_INSPECT':
                        return Object.assign({}, state, { inspectedVariables: Object.assign({}, state.inspectedVariables, (_b = {}, _b[action.name] = action.variables, _b)) });
                    case 'EXPRESSION_SET':
                        return Object.assign({}, state, { expression: action.expression });
                    case 'EXPRESSION_LOAD':
                        return Object.assign({}, state, { expressionResult: action.expressionResult });
                    default:
                        return state;
                }
                var _a, _b;
            }, defaults, redux_1.applyMiddleware(updateGist)));
        }
    }
});
//# sourceMappingURL=store.js.map