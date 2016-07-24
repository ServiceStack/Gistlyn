import { createStore, applyMiddleware } from 'redux';
import { getSortedFileNames } from './utils';
import { queryString, appendQueryString, splitOnFirst, splitOnLast } from './servicestack-client';
import ReactGA from 'react-ga';
import marked from 'marked';

export const Config = {
    LatestVersion: "4.0.60",
};
export const StateKey = "/v1/state";
export const GistCacheKey = (gist) => `/v1/gists/${gist}`;

export const GistTemplates = {
    NewGist: "4fab2fa13aade23c81cabe83314c3cd0",
    NewPrivateGist: "7eaa8f65869fa6682913e3517bec0f7e",
    AddServiceStackReferenceGist: "eefea9cece5419f5d5dc24492d01c07c",
    HomeCollection: "2cc6b5db6afd3ccb0d0149e55fdb3a6a",
    Gists: ["4fab2fa13aade23c81cabe83314c3cd0", "7eaa8f65869fa6682913e3517bec0f7e",
            "eefea9cece5419f5d5dc24492d01c07c", "2cc6b5db6afd3ccb0d0149e55fdb3a6a"]
};

export const FileNames = {
    GistMain: "main.cs",
    GistPackages: "packages.config",
    CollectionIndex: "index.md"
};

export interface IGistMeta {
    id: string;
    description: string;
    public: boolean;
    created_at: string;
    updated_at: string;
    owner_login: string;
    owner_id: string;
    owner_avatar_url: string;
}

export interface IGistFile {
    size: number;
    raw_url: string;
    type: string;
    language: string;
    truncated: boolean;
    content: string;
}

const updateHistory = (id:string, description:string, key:string) => {
    if (!id) return;
    document.title = description;

    if (history.pushState && (!history.state || history.state.id != id)) {
        let qs = queryString(location.href);
        var url = splitOnFirst(location.href, '?')[0];
        qs[key] = id;
        delete qs["s"]; //remove ?s=1 from /auth
        url = appendQueryString(url, qs);
        history.pushState({ id, description }, description, url);
        ReactGA.pageview(url);
    }
};

var collectionsCache = {};

const createGistRequest = (state, gist) => {
    const authUsername = state.activeSub && parseInt(state.activeSub.userId) > 0
        ? state.activeSub.displayName
        : null;

    const disableCache = "?t=" + new Date().getTime();

    var urlPrefix = authUsername //Auth requests gets bigger quota
        ? "/github-proxy/"
        : "https://api.github.com/";

    const req = new Request(urlPrefix + "gists/" + gist + disableCache, authUsername ? { credentials: "include" } : null);
    return req;
};

const createGistMeta = (r:any): IGistMeta => ({
        id: r.id,
        description: r.description,
        public: r.public,
        created_at: r.created_at,
        updated_at: r.updated_at,
        owner_login: r.owner && r.owner.login,
        owner_id: r.owner && r.owner.id,
        owner_avatar_url: r.owner && r.owner.avatar_url
});

const handleGistErrorResponse = (res: any, store: any, id: string) => {
    if (res.status === 403) {
        store.dispatch({ type: 'ERROR_RAISE', error: { message: `Github's public API quota has been exceeded, sign-in to continue for more.` } });
        return;
    }

    if (res.status === 404) {
        localStorage.removeItem(GistCacheKey(id));
        store.dispatch({ type: "GISTSTAT_REMOVE", gist: id });
    } 

    store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: `Gist with hash '${id}' was ${res.statusText}` } });
}; 

const parseMarkdownMeta = (markdown: string): any => {
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
                lines.forEach(line => {
                    var parts = splitOnFirst(line, ":");
                    if (parts.length !== 2) return;
                    meta[parts[0].trim()] = parts[1].trim();
                });
            }
        }
    }
    return { meta, markdown };
}

const serializeGist = (meta: IGistMeta, files) => JSON.stringify({ files, meta });

const createCollection = (store, meta: IGistMeta, indexFile:IGistFile) => {
    if (!indexFile) {
        store.dispatch({ type: 'ERROR_RAISE', error: { message: `Collection has no '${FileNames.CollectionIndex}'` } });
        return;
    }

    var md = parseMarkdownMeta(indexFile.content);
    return {
        id: meta.id,
        owner_login: meta.owner_login,
        description: meta.description,
        html: marked(md.markdown),
        meta: md.meta || {}
    };
};

const stateSideEffects = store => next => action => {
    var oldGist = store.getState().gist;
    var result = next(action);
    var state = store.getState();

    if (action.type !== "LOAD") {
        localStorage.setItem(StateKey, JSON.stringify(state));
    } else if (state.meta) {
        updateHistory(state.meta.id, state.meta.description, "gist");
    }

    if (action.type === "URL_CHANGE" && action.url) {
        const parts = splitOnLast(action.url, '/');
        const id = parts[parts.length - 1];

        //If it's cached we already know what it is: 
        if (localStorage.getItem(GistCacheKey(id))) {
            store.dispatch({ type: "GIST_CHANGE", gist: id });
        } else if (collectionsCache[id]) {
            store.dispatch({ type: "COLLECTION_CHANGE", collection: { id }, showCollection:true });
        } else {
            fetch(createGistRequest(state, id))
                .then((res) => {
                    if (!res.ok) {
                        throw res;
                    } else {
                        return res.json().then((r) => {
                            const meta = createGistMeta(r);
                            //Populate cache and dispatch appropriate action:
                            if (r.files[FileNames.GistMain]) {
                                localStorage.setItem(GistCacheKey(id), serializeGist(meta, r.files));
                                store.dispatch({ type: "GIST_CHANGE", gist: id });
                            } else if (r.files[FileNames.CollectionIndex]) {
                                collectionsCache[meta.id] = createCollection(store, meta, r.files[FileNames.CollectionIndex]);
                                store.dispatch({ type: "COLLECTION_CHANGE", collection: { id }, showCollection: true });
                            } else {
                                store.dispatch({ type: 'ERROR_RAISE', error: { message: `Gist with hash '${id}' has no ${FileNames.GistMain} or ${FileNames.CollectionIndex}` } });
                            }
                        });
                    }
                })
                .catch(res => handleGistErrorResponse(res, store, id));
        }
    }

    const options = action.options || {};
    if (action.type === 'GIST_CHANGE' && action.gist && (options.reload || oldGist !== action.gist || !state.files || !state.meta)) {
        const json = !options.reload ? localStorage.getItem(GistCacheKey(state.gist)) : null;
        if (json) {
            const gist = JSON.parse(json);
            const meta = gist.meta as IGistMeta;
            const files = gist.files;
            updateHistory(meta.id, meta.description, "gist");
            store.dispatch({ type: 'GIST_LOAD', meta, files, activeFileName: getSortedFileNames(files)[0] });
        } else {
            fetch(createGistRequest(state, action.gist))
                .then((res) => {
                    if (!res.ok) {
                        throw res;
                    } else {
                        return res.json().then((r) => {
                            const meta = createGistMeta(r);
                            updateHistory(meta.id, meta.description, "gist");
                            localStorage.setItem(GistCacheKey(state.gist), serializeGist(meta, r.files));
                            store.dispatch({ type: 'GIST_LOAD', meta, files: r.files, activeFileName: options.activeFileName || getSortedFileNames(r.files)[0] });
                        });
                    }
                })
                .catch(res => handleGistErrorResponse(res, store, action.gist));
        }
    } else if (action.type === "SOURCE_CHANGE") {
        localStorage.setItem(GistCacheKey(state.gist), JSON.stringify({ files: state.files, meta: state.meta }));
    } else if (action.type === "GIST_LOAD") {
        const meta = state.meta as IGistMeta;
        if (meta)
            store.dispatch({ type: "GISTSTAT_INCR", gist: meta.id, description: meta.description, stat: "load", step: 1, owner_login: meta.owner_login });
    } else if (action.type === "VARS_LOAD") {
        const meta = state.meta as IGistMeta;
        if (meta)
            store.dispatch({ type: "GISTSTAT_INCR", gist: meta.id, description: meta.description, stat: "exec", step: 1, owner_login: meta.owner_login });
    } else if (action.type === "GISTSTAT_INCR") {
        //console.log(state.gistStats);
    } else if (action.type === "COLLECTION_CHANGE" && action.collection && action.showCollection) {
        var collection = collectionsCache[action.collection.id];
        if (collection) {
            updateHistory(collection.id, collection.description, "collection");
            store.dispatch({ type: 'COLLECTION_LOAD', collection: collection });
            store.dispatch({ type: "GISTSTAT_INCR", gist: collection.id, collection: true, description: collection.description, stat: "load", step: 1, owner_login: collection.owner_login });
            if (collection.meta["gist"] && collection.meta["gist"] !== state.gist) {
                store.dispatch({ type: "GIST_CHANGE", gist: collection.meta["gist"] });
            }
        } else {
            fetch(createGistRequest(state, action.collection.id))
                .then((res) => {
                    if (!res.ok) {
                        throw res;
                    } else {
                        return res.json().then((r) => {
                            const meta = createGistMeta(r);
                            updateHistory(meta.id, meta.description, "collection");

                            collection = createCollection(store, meta, r.files[FileNames.CollectionIndex]);
                            collectionsCache[collection.id] = collection;

                            store.dispatch({ type: 'COLLECTION_LOAD', collection });
                            store.dispatch({ type: "GISTSTAT_INCR", gist: meta.id, collection: true, description: meta.description, stat: "load", step: 1, owner_login: collection.owner_login });
                            if (collection.meta["gist"] && collection.meta["gist"] !== state.gist) {
                                store.dispatch({ type: "GIST_CHANGE", gist: collection.meta["gist"] });
                            }
                        });
                    }
                })
                .catch(res => handleGistErrorResponse(res, store, action.collection.id));
        }
    }

    return result;
};

const defaults = {
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
    showCollection: false
};

const preserveDefaults = (state) => ({
    activeSub: state.activeSub,
    gistStats: state.gistStats,
    collection: state.collection,
    showCollection: state.showCollection
});

export let store = createStore(
    (state, action) => {
        //console.log(action);
        switch (action.type) {
            case 'LOAD':
                return action.state;
            case 'RESET':
                return Object.assign({}, defaults, { activeSub: state.activeSub });
            case 'SSE_CONNECT':
                return Object.assign({}, state, { activeSub: action.activeSub, error: null });
            case 'URL_CHANGE':
                return Object.assign({}, state, { url: action.url });
            case 'GIST_CHANGE':
                return Object.assign({}, defaults, preserveDefaults(state), { gist: action.gist, url: action.gist });
            case 'GIST_LOAD':
                return Object.assign({}, state, { meta: action.meta, files: action.files, activeFileName: action.activeFileName, variables: [], logs: [], hasLoaded: true });
            case 'FILE_SELECT':
                return Object.assign({}, state, { activeFileName: action.activeFileName });
            case 'FILENAME_EDIT':
                return Object.assign({}, state, { editingFileName: action.fileName });
            case 'ERROR_RAISE':
                return Object.assign({}, state, { error: action.error, showCollection:false });
            case 'CONSOLE_LOG':
                return Object.assign({}, state, { logs: [...state.logs, ...action.logs] });
            case 'CONSOLE_CLEAR':
                return Object.assign({}, state, { logs: [{ msg: "" }] });
            case 'SCRIPT_STATUS':
                return Object.assign({}, state, { scriptStatus: action.scriptStatus, showCollection: false });
            case 'SOURCE_CHANGE':
                const file = Object.assign({}, state.files[action.fileName], { content: action.content });
                return Object.assign({}, state, { files: Object.assign({}, state.files, { [action.fileName]: file }), dirty: true });
            case 'VARS_LOAD':
                return Object.assign({}, state, { variables: action.variables, inspectedVariables: {} });
            case 'VARS_INSPECT':
                return Object.assign({}, state, { inspectedVariables: Object.assign({}, state.inspectedVariables, { [action.name]: action.variables }) });
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
            case 'GISTSTAT_INCR':
                const gistStats = state.gistStats;
                const existingStat = gistStats[action.gist];
                const step = state.step || 1;
                return Object.assign({}, state, {
                    gistStats: existingStat
                        ? Object.assign({}, gistStats, {
                            [action.gist]: Object.assign({}, existingStat, { [action.stat]: (existingStat[action.stat] || 0) + step, date: new Date().getTime() })
                        })
                        : Object.assign({}, gistStats, { [action.gist]: { id:action.gist, description: action.description, collection:action.collection, [action.stat]: step, owner_login:action.owner_login, date:new Date().getTime() } })
                });
            case 'GISTSTAT_REMOVE':
                var clone = Object.assign({}, state.gistStats);
                delete clone[action.gist];
                return Object.assign({}, state, { gistStats: clone });
            default:
                return state;
        }
    },
    defaults,
    applyMiddleware(stateSideEffects));