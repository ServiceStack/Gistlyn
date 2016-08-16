System.register(['redux', './utils', 'servicestack-client', 'react-ga', 'marked'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var redux_1, utils_1, servicestack_client_1, react_ga_1, marked_1;
    var updateHistory, collectionsCache, snapshotCache, createGistRequest, createGistMeta, handleGistErrorResponse, parseMarkdownMeta, serializeGist, createCollection, stateSideEffects, defaults, preserveDefaults, store;
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
            },
            function (react_ga_1_1) {
                react_ga_1 = react_ga_1_1;
            },
            function (marked_1_1) {
                marked_1 = marked_1_1;
            }],
        execute: function() {
            updateHistory = function (id, description, key) {
                if (!id)
                    return;
                document.title = description;
                if (history.pushState && (!history.state || history.state[key] != id)) {
                    var qs = servicestack_client_1.queryString(location.href);
                    var url = servicestack_client_1.splitOnFirst(location.href, '?')[0];
                    qs[key] = id;
                    delete qs["s"]; //remove ?s=1 from /auth
                    delete qs["clear"];
                    delete qs["snapshot"];
                    delete qs["expression"];
                    delete qs["activeFileName"];
                    url = servicestack_client_1.appendQueryString(url, qs);
                    history.pushState({ gist: qs["gist"], collection: qs["collection"], description: description }, description, url);
                    react_ga_1.default.pageview(url);
                }
            };
            collectionsCache = {};
            snapshotCache = {};
            createGistRequest = function (state, gist) {
                var authUsername = state.activeSub && parseInt(state.activeSub.userId) > 0
                    ? state.activeSub.displayName
                    : null;
                var disableCache = "?t=" + new Date().getTime();
                var urlPrefix = authUsername //Auth requests gets bigger quota
                    ? "/github-proxy/"
                    : "https://api.github.com/";
                var req = new Request(urlPrefix + "gists/" + gist + disableCache, authUsername ? { credentials: "include" } : null);
                return req;
            };
            createGistMeta = function (r) { return ({
                id: r.id,
                description: r.description,
                public: r.public,
                created_at: r.created_at,
                updated_at: r.updated_at,
                owner_login: r.owner && r.owner.login,
                owner_id: r.owner && r.owner.id,
                owner_avatar_url: r.owner && r.owner.avatar_url
            }); };
            handleGistErrorResponse = function (res, store, id) {
                if (res.status === 403) {
                    store.dispatch({ type: 'ERROR_RAISE', error: { message: "Github's public API quota has been exceeded, sign-in to continue for more." } });
                    return;
                }
                if (res.status === 404) {
                    localStorage.removeItem(utils_1.GistCacheKey(id));
                    store.dispatch({ type: "GISTSTAT_REMOVE", gist: id });
                }
                store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: "Gist with hash '" + id + "' was " + res.statusText } });
            };
            parseMarkdownMeta = function (markdown) {
                var meta = null;
                if (markdown) {
                    markdown = markdown.trim();
                    if (markdown.startsWith("---")) {
                        var endPos = markdown.indexOf("---", "---".length);
                        if (endPos >= 0) {
                            var metaStr = markdown.substring(0, endPos);
                            markdown = markdown.substring(endPos + "---".length);
                            var lines = metaStr.split(/\r?\n/);
                            meta = {};
                            lines.forEach(function (line) {
                                var parts = servicestack_client_1.splitOnFirst(line, ":");
                                if (parts.length !== 2)
                                    return;
                                meta[parts[0].trim()] = parts[1].trim();
                            });
                        }
                    }
                }
                return { meta: meta, markdown: markdown };
            };
            serializeGist = function (meta, files) { return JSON.stringify({ files: files, meta: meta }); };
            createCollection = function (store, meta, indexFile) {
                if (!indexFile) {
                    store.dispatch({ type: 'ERROR_RAISE', error: { message: "Collection has no '" + utils_1.FileNames.CollectionIndex + "'" } });
                    return;
                }
                var md = parseMarkdownMeta(indexFile.content);
                return {
                    id: meta.id,
                    owner_login: meta.owner_login,
                    description: meta.description,
                    html: marked_1.default(md.markdown),
                    meta: md.meta || {}
                };
            };
            stateSideEffects = function (store) { return function (next) { return function (action) {
                var oldGist = store.getState().gist;
                var result = next(action);
                var state = store.getState();
                if (action.type !== "LOAD") {
                    localStorage.setItem(utils_1.StateKey, JSON.stringify(state));
                }
                else if (state.meta) {
                    updateHistory(state.meta.id, state.meta.description, "gist");
                }
                if (action.type === "URL_CHANGE" && action.url) {
                    var parts = servicestack_client_1.splitOnLast(action.url, '/');
                    var id_1 = parts[parts.length - 1];
                    //If it's cached we already know what it is: 
                    var gistJson = localStorage.getItem(utils_1.GistCacheKey(id_1));
                    if (gistJson) {
                        var gist = JSON.parse(gistJson);
                        if (gist.files[utils_1.FileNames.CollectionIndex]) {
                            store.dispatch({ type: "COLLECTION_CHANGE", collection: { id: id_1 }, showCollection: true });
                        }
                        else {
                            store.dispatch({ type: "GIST_CHANGE", gist: id_1 });
                        }
                    }
                    else if (collectionsCache[id_1]) {
                        store.dispatch({ type: "COLLECTION_CHANGE", collection: { id: id_1 }, showCollection: true });
                    }
                    else if (snapshotCache[id_1]) {
                        store.dispatch({ type: "SNAPSHOT_LOAD", snapshot: snapshotCache[id_1] });
                    }
                    else {
                        fetch(createGistRequest(state, id_1))
                            .then(function (res) {
                            if (!res.ok) {
                                throw res;
                            }
                            else {
                                return res.json().then(function (r) {
                                    var meta = createGistMeta(r);
                                    //Populate cache and dispatch appropriate action:
                                    if (r.files[utils_1.FileNames.GistMain]) {
                                        localStorage.setItem(utils_1.GistCacheKey(id_1), serializeGist(meta, r.files));
                                        store.dispatch({ type: "GIST_CHANGE", gist: id_1 });
                                    }
                                    else if (r.files[utils_1.FileNames.CollectionIndex]) {
                                        collectionsCache[meta.id] = createCollection(store, meta, r.files[utils_1.FileNames.CollectionIndex]);
                                        store.dispatch({ type: "COLLECTION_CHANGE", collection: { id: id_1 }, showCollection: true });
                                    }
                                    else if (r.files[utils_1.FileNames.Snapshot]) {
                                        var file = r.files[utils_1.FileNames.Snapshot];
                                        var json = file && file.content;
                                        try {
                                            if (json) {
                                                var snapshot = snapshotCache[meta.id] = JSON.parse(json);
                                                store.dispatch({ type: "SNAPSHOT_LOAD", snapshot: snapshot });
                                            }
                                            else
                                                throw "Invalid Snapshot";
                                        }
                                        catch (e) {
                                            console.log("ERROR loading snapshot:", e, json);
                                            store.dispatch({ type: 'ERROR_RAISE', error: { message: "Gist with hash '" + id_1 + "' is not a valid snapshot" } });
                                        }
                                    }
                                    else {
                                        store.dispatch({ type: 'ERROR_RAISE', error: { message: "Gist with hash '" + id_1 + "' has no " + utils_1.FileNames.GistMain + " or " + utils_1.FileNames.CollectionIndex } });
                                    }
                                });
                            }
                        })
                            .catch(function (res) { return handleGistErrorResponse(res, store, id_1); });
                    }
                }
                var options = action.options || {};
                if (action.type === 'GIST_CHANGE' && action.gist && (options.reload || oldGist !== action.gist || !state.files || !state.meta)) {
                    var json = !options.reload ? localStorage.getItem(utils_1.GistCacheKey(state.gist)) : null;
                    if (json) {
                        var gist = JSON.parse(json);
                        var meta = gist.meta;
                        var files = gist.files;
                        updateHistory(meta.id, meta.description, "gist");
                        store.dispatch({ type: 'GIST_LOAD', meta: meta, files: files, activeFileName: options.activeFileName || utils_1.getSortedFileNames(files)[0] });
                    }
                    else {
                        fetch(createGistRequest(state, action.gist))
                            .then(function (res) {
                            if (!res.ok) {
                                throw res;
                            }
                            else {
                                return res.json().then(function (r) {
                                    var meta = createGistMeta(r);
                                    updateHistory(meta.id, meta.description, "gist");
                                    localStorage.setItem(utils_1.GistCacheKey(state.gist), serializeGist(meta, r.files));
                                    store.dispatch({ type: 'GIST_LOAD', meta: meta, files: r.files, activeFileName: options.activeFileName || utils_1.getSortedFileNames(r.files)[0] });
                                });
                            }
                        })
                            .catch(function (res) { return handleGistErrorResponse(res, store, action.gist); });
                    }
                }
                else if (action.type === "SOURCE_CHANGE") {
                    if (state.gist !== utils_1.GistTemplates.AddServiceStackReferenceGist) {
                        localStorage.setItem(utils_1.GistCacheKey(state.gist), JSON.stringify({ files: state.files, meta: state.meta }));
                    }
                    if (state.collection && state.collection.id === state.gist && action.fileName === utils_1.FileNames.CollectionIndex) {
                        var collection_1 = Object.assign({}, state.collection, { html: marked_1.default(action.content) });
                        collectionsCache[state.gist] = collection_1;
                        store.dispatch({ type: 'COLLECTION_LOAD', collection: collection_1 });
                    }
                }
                else if (action.type === "GIST_LOAD") {
                    var meta = state.meta;
                    if (meta)
                        store.dispatch({ type: "GISTSTAT_INCR", gist: meta.id, description: meta.description, stat: "load", step: 1, owner_login: meta.owner_login });
                }
                else if (action.type === "VARS_LOAD") {
                    var meta = state.meta;
                    if (meta)
                        store.dispatch({ type: "GISTSTAT_INCR", gist: meta.id, description: meta.description, stat: "exec", step: 1, owner_login: meta.owner_login });
                }
                else if (action.type === "GISTSTAT_INCR") {
                }
                else if (action.type === "COLLECTION_CHANGE" && action.collection && action.showCollection) {
                    var id_2 = action.collection.id;
                    var gistJson = localStorage.getItem(utils_1.GistCacheKey(id_2));
                    if (gistJson) {
                        var gist = JSON.parse(gistJson);
                        collectionsCache[id_2] = createCollection(store, gist.meta, gist.files[utils_1.FileNames.CollectionIndex]);
                    }
                    var collection = collectionsCache[id_2];
                    if (collection) {
                        updateHistory(collection.id, collection.description, "collection");
                        store.dispatch({ type: 'COLLECTION_LOAD', collection: collection });
                        store.dispatch({ type: "GISTSTAT_INCR", gist: id_2, collection: true, description: collection.description, stat: "load", step: 1, owner_login: collection.owner_login });
                        if (collection.meta["gist"] && collection.meta["gist"] !== state.gist) {
                            store.dispatch({ type: "GIST_CHANGE", gist: collection.meta["gist"] });
                        }
                    }
                    else {
                        fetch(createGistRequest(state, id_2))
                            .then(function (res) {
                            if (!res.ok) {
                                throw res;
                            }
                            else {
                                return res.json().then(function (r) {
                                    var meta = createGistMeta(r);
                                    updateHistory(meta.id, meta.description, "collection");
                                    collection = createCollection(store, meta, r.files[utils_1.FileNames.CollectionIndex]);
                                    collectionsCache[id_2] = collection;
                                    store.dispatch({ type: 'COLLECTION_LOAD', collection: collection });
                                    store.dispatch({ type: "GISTSTAT_INCR", gist: id_2, collection: true, description: meta.description, stat: "load", step: 1, owner_login: collection.owner_login });
                                    if (collection.meta["gist"] && collection.meta["gist"] !== state.gist) {
                                        store.dispatch({ type: "GIST_CHANGE", gist: collection.meta["gist"] });
                                    }
                                });
                            }
                        })
                            .catch(function (res) { return handleGistErrorResponse(res, store, action.collection.id); });
                    }
                }
                return result;
            }; }; };
            defaults = {
                version: 1,
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
                dialog: null,
                gistStats: {},
                dirty: false,
                collection: null,
                snapshot: null,
                showCollection: false
            };
            preserveDefaults = function (state) { return ({
                activeSub: state.activeSub,
                gistStats: state.gistStats,
                collection: state.collection,
                showCollection: state.showCollection
            }); };
            exports_1("store", store = redux_1.createStore(function (state, action) {
                //console.log(action);
                switch (action.type) {
                    case 'LOAD':
                        return action.state;
                    case 'RESET':
                        return Object.assign({}, defaults, { activeSub: state.activeSub });
                    case 'SSE_CONNECT':
                        return Object.assign({}, state, { activeSub: action.activeSub, error: null });
                    case 'URL_CHANGE':
                        return Object.assign({}, state, { url: action.url, error: null });
                    case 'GIST_CHANGE':
                        return Object.assign({}, defaults, preserveDefaults(state), { gist: action.gist, url: action.gist });
                    case 'GIST_LOAD':
                        return Object.assign({}, state, { meta: action.meta, files: action.files, activeFileName: action.activeFileName, variables: [], logs: [], hasLoaded: true });
                    case 'FILE_SELECT':
                        return Object.assign({}, state, { activeFileName: action.activeFileName });
                    case 'FILENAME_EDIT':
                        return Object.assign({}, state, { editingFileName: action.fileName });
                    case 'ERROR_RAISE':
                        return Object.assign({}, state, { error: action.error, showCollection: false });
                    case 'CONSOLE_LOG':
                        return Object.assign({}, state, { logs: state.logs.concat(action.logs) });
                    case 'CONSOLE_CLEAR':
                        return Object.assign({}, state, { logs: [{ msg: "" }] });
                    case 'SCRIPT_STATUS':
                        return Object.assign({}, state, { scriptStatus: action.scriptStatus, showCollection: false });
                    case 'META_UPDATE':
                        return Object.assign({}, state, { meta: Object.assign({}, state.meta, { description: action.description }), dirty: true });
                    case 'SOURCE_CHANGE':
                        var file = Object.assign({}, state.files[action.fileName], { content: action.content });
                        return Object.assign({}, state, { files: Object.assign({}, state.files, (_a = {}, _a[action.fileName] = file, _a)), dirty: true });
                    case 'FILE_ADD':
                        return Object.assign({}, state, { files: Object.assign({}, state.files, (_b = {}, _b[action.fileName] = action.file, _b)), dirty: true });
                    case 'VARS_LOAD':
                        return Object.assign({}, state, { variables: action.variables, inspectedVariables: {} });
                    case 'VARS_INSPECT':
                        return Object.assign({}, state, { inspectedVariables: Object.assign({}, state.inspectedVariables, (_c = {}, _c[action.name] = action.variables, _c)) });
                    case 'EXPRESSION_SET':
                        return Object.assign({}, state, { expression: action.expression });
                    case 'EXPRESSION_LOAD':
                        return Object.assign({}, state, { expressionResult: action.expressionResult });
                    case 'DIALOG_SHOW':
                        return Object.assign({}, state, { dialog: action.dialog });
                    case 'DIRTY_SET':
                        return Object.assign({}, state, { dirty: action.dirty });
                    case 'COLLECTION_CHANGE':
                        return Object.assign({}, state, { collection: action.collection, showCollection: action.showCollection, url: action.collection && action.collection.id });
                    case 'COLLECTION_LOAD':
                        return Object.assign({}, state, { collection: action.collection, showCollection: true });
                    case 'SNAPSHOT_LOAD':
                        return Object.assign({}, state, action.snapshot, { activeSub: state.activeSub });
                    case 'GISTSTAT_INCR':
                        var gistStats = state.gistStats;
                        var existingStat = gistStats[action.gist];
                        var step = state.step || 1;
                        return Object.assign({}, state, {
                            gistStats: existingStat
                                ? Object.assign({}, gistStats, (_d = {},
                                    _d[action.gist] = Object.assign({}, existingStat, (_e = {}, _e[action.stat] = (existingStat[action.stat] || 0) + step, _e.date = new Date().getTime(), _e)),
                                    _d
                                ))
                                : Object.assign({}, gistStats, (_f = {}, _f[action.gist] = (_g = { id: action.gist, description: action.description, collection: action.collection }, _g[action.stat] = step, _g.owner_login = action.owner_login, _g.date = new Date().getTime(), _g), _f))
                        });
                    case 'GISTSTAT_REMOVE':
                        var clone = Object.assign({}, state.gistStats);
                        delete clone[action.gist];
                        return Object.assign({}, state, { gistStats: clone });
                    default:
                        return state;
                }
                var _a, _b, _c, _d, _e, _f, _g;
            }, defaults, redux_1.applyMiddleware(stateSideEffects)));
        }
    }
});
//# sourceMappingURL=state.js.map