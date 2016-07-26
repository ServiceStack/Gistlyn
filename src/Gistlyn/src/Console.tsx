import * as React from 'react';

export default class Console extends React.Component<any, any> {
    consoleScroll: HTMLDivElement;

    componentDidUpdate() {
        if (!this.consoleScroll) return;
        this.consoleScroll.scrollTop = this.consoleScroll.scrollHeight;
    }

    render() {
        return (
            <div id="console" className="section" ref={(el) => this.consoleScroll = el}>
                <b className="noselect" style={{ background: "#444", color: "#fff", padding: "1px 0px 1px 8px", position: "absolute", right: "3px", margin: "-22px 0" }}>
                    console
                    <i className="material-icons noselect" style={{ fontSize: 16, padding: "0 4px 0 4px", verticalAlign: "sub", cursor: "pointer" }}
                        onClick={e => this.props.showDialog("console-viewer")}>open_in_new</i>
                </b>
                <i className="material-icons clear-btn" title="clear console" onClick={e => this.props.onClear() }>clear</i>
                <div className="scroll">
                    <table style={{ width: "100%" }} className="console">
                        <tbody style={{ font: "13px/18px monospace", color: "#444" }}>
                            {this.props.logs.map(log => (
                                <tr>
                                    <td style={{ padding: "2px 8px", tabSize: 4 }}><pre className={log.cls}>{log.msg}</pre></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>);
    }
}