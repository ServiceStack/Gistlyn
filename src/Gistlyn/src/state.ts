import { createStore, applyMiddleware } from 'redux';
import { getSortedFileNames } from './utils';
import { queryString, appendQueryString, splitOnFirst } from './servicestack-client';
import ReactGA from 'react-ga';
import marked from 'marked';

export const StateKey = "/v1/state";
export const GistCacheKey = (gist) => `/v1/gists/${gist}`;

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

const updateHistory = (meta: IGistMeta, key:string) => {
    if (!meta) return;
    document.title = meta.description;

    if (history.pushState && (!history.state || history.state.id != meta.id)) {
        let qs = queryString(location.href);
        var url = splitOnFirst(location.href, '?')[0];
        qs[key] = meta.id;
        url = appendQueryString(url, qs);
        history.pushState(meta, meta.description, url);
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
        ? "/proxy/"
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

const updateGist = store => next => action => {
    var oldGist = store.getState().gist;
    var result = next(action);
    var state = store.getState();

    if (action.type !== "LOAD") {
        localStorage.setItem(StateKey, JSON.stringify(state));
    } else {
        updateHistory(state.meta, "gist");
    }

    const options = action.options || {};
    if (action.type === 'GIST_CHANGE' && action.gist && (options.reload || oldGist !== action.gist || !state.files || !state.meta)) {
        const json = !options.reload ? localStorage.getItem(GistCacheKey(state.gist)) : null;
        if (json) {
            const gist = JSON.parse(json);
            const meta = gist.meta as IGistMeta;
            const files = gist.files;
            updateHistory(meta, "gist");
            store.dispatch({ type: 'GIST_LOAD', meta, files, activeFileName: getSortedFileNames(files)[0] });
        } else {
            fetch(createGistRequest(state, action.gist))
                .then((res) => {
                    if (!res.ok) {
                        throw res;
                    } else {
                        return res.json().then((r) => {
                            const meta = createGistMeta(r);
                            updateHistory(meta, "gist");
                            localStorage.setItem(GistCacheKey(state.gist), JSON.stringify({ files: r.files, meta }));
                            store.dispatch({ type: 'GIST_LOAD', meta, files: r.files, activeFileName: options.activeFileName || getSortedFileNames(r.files)[0] });
                        });
                    }
                })
                .catch(res => {
                    store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: `Gist with hash '${action.gist}' was ${res.statusText}` } });
                });
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
                            updateHistory(meta, "collection");
                            const file = r.files["index.md"];
                            if (!file) {
                                store.dispatch({ type: 'ERROR_RAISE', error: { message: "Collection has no 'index.md'" } });
                                return;
                            }

                            var md = parseMarkdownMeta(file.content);

                            collection = {
                                id: action.collection.id,
                                owner_login: meta.owner_login,
                                description: meta.description,
                                html: marked(md.markdown),
                                meta: md.meta || {}
                            };
                            collectionsCache[collection.id] = collection;
                            store.dispatch({ type: 'COLLECTION_LOAD', collection });
                            store.dispatch({ type: "GISTSTAT_INCR", gist: meta.id, collection: true, description: meta.description, stat: "load", step: 1, owner_login: collection.owner_login });
                            if (collection.meta["gist"] && collection.meta["gist"] !== state.gist) {
                                store.dispatch({ type: "GIST_CHANGE", gist: collection.meta["gist"] });
                            }
                        });
                    }
                })
                .catch(res => {
                    store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: `Collection with hash '${action.gist}' was ${res.statusText}` } });
                });
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
        switch (action.type) {
            case 'LOAD':
                return action.state;
            case 'SSE_CONNECT':
                return Object.assign({}, state, { activeSub: action.activeSub });
            case 'GIST_CHANGE':
                return Object.assign({}, defaults, preserveDefaults(state), { gist: action.gist });
            case 'GIST_LOAD':
                return Object.assign({}, state, { meta: action.meta, files: action.files, activeFileName: action.activeFileName, variables: [], logs: [], hasLoaded: true });
            case 'FILE_SELECT':
                return Object.assign({}, state, { activeFileName: action.activeFileName });
            case 'FILENAME_EDIT':
                return Object.assign({}, state, { editingFileName: action.fileName });
            case 'ERROR_RAISE':
                return Object.assign({}, state, { error: action.error });
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
                return Object.assign({}, state, { collection: action.collection, showCollection: action.showCollection });
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
            default:
                return state;
        }
    },
    defaults,
    applyMiddleware(updateGist));