export interface IReturnVoid {
}

export interface IReturn<T> {
}


export interface ISseCommand {
    userId: string;
    displayName: string;
    channels: string;
    profileUrl: string;
}

export interface ISseHeartbeat extends ISseCommand { }
export interface ISseJoin extends ISseCommand { }
export interface ISseLeave extends ISseCommand { }
export interface ISseUpdate extends ISseCommand { }

export interface ISseConnect extends ISseCommand {
    id: string;
    unRegisterUrl: string;
    heartbeatUrl: string;
    updateSubscriberUrl: string;
    heartbeatIntervalMs: number;
    idleTimeoutMs: number;
}

export interface IReconnectServerEventsOptions {
    url?: string;
    onerror?: (...args: any[]) => void;
    onmessage?: (...args: any[]) => void;
    errorArgs?: any[];
}

/**
 * EventSource
 */
export enum ReadyState { CONNECTING = 0, OPEN = 1, CLOSED = 2 }

export interface IEventSourceStatic extends EventTarget {
    new (url: string, eventSourceInitDict?: IEventSourceInit): IEventSourceStatic;
    url: string;
    withCredentials: boolean;
    CONNECTING: ReadyState; // constant, always 0
    OPEN: ReadyState; // constant, always 1
    CLOSED: ReadyState; // constant, always 2
    readyState: ReadyState;
    onopen: Function;
    onmessage: (event: IOnMessageEvent) => void;
    onerror: Function;
    close: () => void;
}

export interface IEventSourceInit {
    withCredentials?: boolean;
}

export interface IOnMessageEvent {
    data: string;
}

declare var EventSource:IEventSourceStatic;

export class ServerEventsClient {
    eventSourceUrl: string;
    updateSubscriberUrl: string;
    eventSourceStop: boolean;

    constructor(
        public baseUrl: string,
        public channels: string[],
        public options: any = {},
        public eventSource: IEventSourceStatic = null)
    {
        this.eventSourceUrl = combinePaths(baseUrl, 'event-stream');
        if (eventSource == null) {
            this.eventSource = new EventSource(this.eventSourceUrl);
            this.eventSource.onmessage = this.onMessage.bind(this);
        }
    }

    onMessage(e: IOnMessageEvent) {
        var opt = this.options;

        var parts = splitOnFirst(e.data, ' ');
        var selector = parts[0];
        var selParts = splitOnFirst(selector, "@");
        if (selParts.length > 1) {
            (e as any).channel = selParts[0];
            selector = selParts[1];
        }
        const json = parts[1];
        const msg = json ? JSON.parse(json) : null;

        parts = splitOnFirst(selector, '.');
        if (parts.length <= 1)
            throw "invalid selector format: " + selector;

        var op = parts[0],
            target = parts[1].replace(new RegExp("%20", 'g'), " ");

        if (opt.validate && opt.validate(op, target, msg, json) === false)
            return;

        const tokens = splitOnFirst(target, "$");
        const [cmd, cssSel] = tokens;
        const els = cssSel && document.querySelectorAll(cssSel);
        const el = els && els[0];

        var headers = new Headers();
        headers.set("Content-Type", "text/plain");

        if (op === "cmd") {
            if (cmd === "onConnect") {
                Object.assign(opt, msg);
                if (opt.heartbeatUrl) {
                    if (opt.heartbeat) {
                        window.clearInterval(opt.heartbeat);
                    }
                    opt.heartbeat = window.setInterval(() => {
                        if (this.eventSource.readyState === 2) //CLOSED
                        {
                            window.clearInterval(opt.heartbeat);
                            const stopFn = opt.handlers["onStop"];
                            if (stopFn != null)
                                stopFn.apply(this.eventSource);
                            this.reconnectServerEvents({ errorArgs: { error: "CLOSED" } });
                            return;
                        }

                        var req = new Request(opt.heartbeatUrl, {
                            method: "POST",
                            mode: "cors",
                            headers: headers
                        });
                        fetch(req)
                            .then(res => {
                                if (!res.ok)
                                    throw res;
                            })
                            .catch(res => {
                                this.reconnectServerEvents({ errorArgs: [res] });
                            });
                    }, parseInt(opt.heartbeatIntervalMs) || 10000);
                }
                if (opt.unRegisterUrl) {
                    window.onunload = () => {
                        fetch(new Request(opt.unRegisterUrl, {
                                method: "POST",
                                mode: "cors",
                                headers: headers
                            }))
                            .then(res => {
                                if (!res.ok)
                                    throw res;
                            })
                            .catch(res => null); //ignore
                    };
                }
                this.updateSubscriberUrl = opt.updateSubscriberUrl;
                this.updateChannels((opt.channels || "").split(","));
            }
            var fn = opt.handlers[cmd];
            if (fn) {
                fn.call(el || document.body, msg, e);
            }
        }
        else if (op === "trigger") {
            //$(el || document).trigger(cmd, [msg, e]);
        }
        else if (op === "css") {
            css(els || document.querySelectorAll("body"), cmd, msg);
        }
        else {
            var r = opt.receivers && opt.receivers[op];
            this.invokeReceiver(r, cmd, el, msg, e, op);
        }

        if (opt.success) {
            opt.success(selector, msg, e);
        }
    }

    reconnectServerEvents(opt:any={}) {
        if (this.eventSourceStop)
            return this.eventSource;

        const hold = this.eventSource;
        const es = new EventSource(opt.url || this.eventSourceUrl || hold.url);
        es.onerror = opt.onerror || hold.onerror;
        es.onmessage = opt.onmessage || hold.onmessage;
        const fn = this.options.handlers["onReconnect"];
        if (fn != null)
            fn.apply(es, opt.errorArgs);
        hold.close();
        return this.eventSource = es;
    }

    invokeReceiver(r, cmd, el, msg, e, name) {
        if (r) {
            if (typeof(r[cmd]) == "function") {
                r[cmd].call(el || r[cmd], msg, e);
            } else {
                r[cmd] = msg;
            }
        }
    }

    updateChannels(channels) {
        this.channels = channels;
        if (!this.eventSource) return;
        const url = this.eventSource.url;
        this.eventSourceUrl = url.substring(0, Math.min(url.indexOf("?"), url.length)) + "?channels=" + channels.join(",");
    }
}

export class JsonServiceClient
{
    baseUrl: string;
    constructor(baseUrl: string) { this.baseUrl = baseUrl; }

    get<T>(request: IReturn<T>): Promise<T> {
        console.log(request);
        return fetch("/").then(r => <T>null);
    }
}

/* utils */

export const css = (selector: string | NodeListOf<Element>, name: string, value:string) => {
    const els = typeof selector == "string"
        ? document.querySelectorAll(selector as string)
        : selector as NodeListOf<Element>;

    for (let i = 0; i < els.length; i++) {
        const el = els[i] as any;
        if (el != null && el.style != null) {
            el.style[name] = value;
        }
    }
}

export const splitOnFirst = (s, c) : string[] => {
    if (!s) return [s];
    var pos = s.indexOf(c);
    return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s];
};

export const queryString = (url) : any => {
    if (!url || url.indexOf('?') === -1) return {};
    var pairs = splitOnFirst(url, '?')[1].split('&');
    var map = {};
    for (var i = 0; i < pairs.length; ++i) {
        var p = pairs[i].split('=');
        map[p[0]] = p.length > 1
            ? decodeURIComponent(p[1].replace(/\+/g, ' '))
            : null;
    }
    return map;
};

export const combinePaths = (...paths:string[]) : string => {
    var parts = [], i, l;
    for (i = 0, l = paths.length; i < l; i++) {
        var arg = paths[i];
        parts = arg.indexOf("://") === -1
            ? parts.concat(arg.split("/"))
            : parts.concat(arg.lastIndexOf("/") === arg.length - 1 ? arg.substring(0, arg.length - 1) : arg);
    }
    var combinedPaths = [];
    for (i = 0, l = parts.length; i < l; i++) {
        var part = parts[i];
        if (!part || part === ".") continue;
        if (part === "..") combinedPaths.pop();
        else combinedPaths.push(part);
    }
    if (parts[0] === "") combinedPaths.unshift("");
    return combinedPaths.join("/") || (combinedPaths.length ? "/" : ".");
};
