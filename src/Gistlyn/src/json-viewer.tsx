import * as React from 'react';

export interface IPrettyPrintProps {
    value?: any;
    json?: string;
}

export class JsonViewer extends React.Component<IPrettyPrintProps, any> {
    render() {
        const value = this.props.value || (this.props.json && JSON.parse(this.props.json));
        return (<div className="jsonviewer">{val(value)}</div>);
    }
}

const show = (k) => typeof k !== "string" || k.substr(0, 2) !== "__";
const keyFmt = t => t;
const uniqueKeys = (m: any[]): any => {
    var h = {};
    for (var i = 0, len = m.length; i < len; i++) {
        for (let k in m[i]) {
            if (show(k))
                h[k] = k;
        }
    }
    return h;
};

var valueFmt = (k, v, vFmt) => vFmt;

const num = (m) => m;
const date = (s) => new Date(parseFloat(/Date\(([^)]+)\)/.exec(s)[1]));
const pad = (d) => d < 10 ? '0' + d : d;
const dmft = (d) => d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
var str = (m) => m.substr(0, 6) === '/Date(' ? dmft(date(m)) : m;

const obj = (m:any) => {
    return (
        <dl>
            {Object.keys(m).filter(show).map(k => (
                [<dt className="ib">{keyFmt(k)}</dt>,<dd>{valueFmt(k, m[k], val(m[k]))}</dd>]
            ))}
        </dl>
    );
}

const arr = (m: any[]) => {
    if (typeof m[0] == 'string' || typeof m[0] == 'number')
        return <span>{m.join(', ') }</span>;

    var h = uniqueKeys(m);
    return (
        <table>
            <caption></caption>
            <thead>
                <tr>
                    {Object.keys(h).map(k => (<th><b></b>{keyFmt(k) }</th>)) }
                </tr>
            </thead>
            <tbody>
                {m.map(row => (
                    <tr>
                        {Object.keys(h).filter(show).map(k => <td>{valueFmt(k, row[k], val(row[k])) }</td>) }
                    </tr>
                )) }
            </tbody>
        </table>
    );
}

const val = (m: any, valueFn: (k: string, v: any, vFmt: string) => string = null) => {
    if (valueFn)
        valueFmt = valueFn;
    if (m == null) return "";
    if (typeof m == "number") return num(m);
    if (typeof m == "string") return str(m);
    if (typeof m == "boolean") return m ? "true" : "false";
    return m.length ? arr(m) : obj(m);
}
