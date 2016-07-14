System.register(['redux', './utils', './servicestack-client'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var redux_1, utils_1, servicestack_client_1;
    var StateKey, GistCacheKey, updateHistory, updateGist, defaults, store;
    return {
        setters:[
            function (redux_1_1) {
                redux_1 = redux_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            }],
        execute: function() {
            exports_1("StateKey", StateKey = "/v1/state");
            exports_1("GistCacheKey", GistCacheKey = function (gist) { return ("/v1/gists/" + gist); });
            updateHistory = function (meta) {
                if (!meta)
                    return;
                document.title = meta.description;
                if (history.pushState && (!history.state || history.state.id != meta.id)) {
                    var qs = servicestack_client_1.queryString(location.href);
                    var cleanUrl = servicestack_client_1.splitOnFirst(location.href, '#')[0];
                    var url = servicestack_client_1.splitOnFirst(location.href, '?')[0];
                    qs["gist"] = meta.id;
                    url = servicestack_client_1.appendQueryString(url, qs);
                    history.pushState(meta, meta.description, url);
                }
            };
            updateGist = function (store) { return function (next) { return function (action) {
                var oldGist = store.getState().gist;
                var result = next(action);
                var state = store.getState();
                if (action.type !== "LOAD") {
                    localStorage.setItem(StateKey, JSON.stringify(state));
                }
                else {
                    updateHistory(state.meta);
                }
                var options = action.options || {};
                if (action.type === 'GIST_CHANGE' && action.gist && (options.reload || oldGist !== action.gist || !state.files || !state.meta)) {
                    var json = !options.reload ? localStorage.getItem(GistCacheKey(state.gist)) : null;
                    if (json) {
                        var gist = JSON.parse(json);
                        var meta = gist.meta;
                        var files = gist.files;
                        updateHistory(meta);
                        store.dispatch({ type: 'GIST_LOAD', meta: meta, files: files, activeFileName: utils_1.getSortedFileNames(files)[0] });
                    }
                    else {
                        var authUsername = state.activeSub && parseInt(state.activeSub.userId) > 0
                            ? state.activeSub.displayName
                            : null;
                        var disableCache = "?t=" + new Date().getTime();
                        var urlPrefix = authUsername //Auth requests gets bigger quota
                            ? "/proxy/"
                            : "https://api.github.com/";
                        fetch(new Request(urlPrefix + "gists/" + action.gist + disableCache, { credentials: "include" }))
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
                                    updateHistory(meta);
                                    localStorage.setItem(GistCacheKey(state.gist), JSON.stringify({ files: r.files, meta: meta }));
                                    store.dispatch({ type: 'GIST_LOAD', meta: meta, files: r.files, activeFileName: options.activeFileName || utils_1.getSortedFileNames(r.files)[0] });
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
                editingFileName: null,
                hasLoaded: false,
                error: null,
                scriptStatus: null,
                logs: [],
                variables: [],
                inspectedVariables: {},
                expression: null,
                expressionResult: null,
                dialog: null
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
                    case 'FILENAME_EDIT':
                        return Object.assign({}, state, { editingFileName: action.fileName });
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
                    case 'DIALOG_SHOW':
                        return Object.assign({}, state, { dialog: action.dialog });
                    default:
                        return state;
                }
                var _a, _b;
            }, defaults, redux_1.applyMiddleware(updateGist)));
        }
    }
});
//# sourceMappingURL=state.js.map