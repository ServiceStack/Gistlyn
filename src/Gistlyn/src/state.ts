import { createStore, applyMiddleware } from 'redux';
import { getSortedFileNames } from './utils';
import { queryString, appendQueryString, splitOnFirst } from './servicestack-client';

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

const updateHistory = (meta: IGistMeta) => {
    if (!meta) return;
    document.title = meta.description;

    if (history.pushState && (!history.state || history.state.id != meta.id)) {
        let qs = queryString(location.href);
        let cleanUrl = splitOnFirst(location.href, '#')[0];
        var url = splitOnFirst(location.href, '?')[0];
        qs["gist"] = meta.id;
        url = appendQueryString(url, qs);
        history.pushState(meta, meta.description, url);
    }
};

const updateGist = store => next => action => {
    var oldGist = store.getState().gist;
    var result = next(action);
    var state = store.getState();

    if (action.type !== "LOAD") {
        localStorage.setItem(StateKey, JSON.stringify(state));
    } else {
        updateHistory(state.meta);
    }

    const options = action.options || {};
    if (action.type === 'GIST_CHANGE' && action.gist && (options.reload || oldGist !== action.gist || !state.files || !state.meta)) {
        const json = !options.reload ? localStorage.getItem(GistCacheKey(state.gist)) : null;
        if (json) {
            const gist = JSON.parse(json);
            const meta = gist.meta as IGistMeta;
            const files = gist.files;
            updateHistory(meta);
            store.dispatch({ type: 'GIST_LOAD', meta, files, activeFileName: getSortedFileNames(files)[0] });
        } else {
            const authUsername = state.activeSub && parseInt(state.activeSub.userId) > 0 
                ? state.activeSub.displayName 
                : null;

            const disableCache = "?t=" + new Date().getTime();

            var urlPrefix = authUsername //Auth requests gets bigger quota
                ? "/proxy/"
                : "https://api.github.com/";

            fetch(new Request(urlPrefix + "gists/" + action.gist + disableCache, { credentials: "include" }))
                .then((res) => {
                    if (!res.ok) {
                        throw res;
                    } else {
                        return res.json().then((r) => {
                            const meta: IGistMeta = {
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
    dialog: null
};

export let store = createStore(
    (state, action) => {
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
                return Object.assign({}, state, { logs: [...state.logs, ...action.logs] });
            case 'CONSOLE_CLEAR':
                return Object.assign({}, state, { logs: [{ msg: "" }] });
            case 'SCRIPT_STATUS':
                return Object.assign({}, state, { scriptStatus: action.scriptStatus });
            case 'SOURCE_CHANGE':
                const file = Object.assign({}, state.files[action.fileName], { content: action.content });
                return Object.assign({}, state, { files: Object.assign({}, state.files, { [action.fileName]: file }) });
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
            default:
                return state;
        }
    },
    defaults,
    applyMiddleware(updateGist));