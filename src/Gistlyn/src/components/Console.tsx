import * as React from 'react';

export default class Console extends React.Component<any, any> {
    consoleScroll: HTMLDivElement;

    componentDidUpdate() {
        if (!this.consoleScroll) return;
        this.consoleScroll.scrollTop = this.consoleScroll.scrollHeight;
    }

    render() {
        return (
            <div id="console" className="section" style={{ borderTop: "solid 1px #ddd", borderBottom: "solid 1px #ddd", font: "14px/20px arial", height: "350px" }}>
                <b style={{ background: "#444", color: "#fff", padding: "1px 8px", position: "absolute", right: "3px", margin: "-22px 0" }}>console</b>
                <i className="material-icons clear-btn" title="clear console" onClick={e => this.props.onClear() }>clear</i>
                <div className="scroll" style={{ overflow: "auto", height: "350px" }} ref={(el) => this.consoleScroll = el}>
                    <table style={{ width: "100%" }}>
                        <tbody style={{ font: "13px/18px monospace", color: "#444" }}>
                            {this.props.logs.map(log => (
                                <tr>
                                    <td style={{ padding: "2px 8px", tabSize: 4 }}><pre className={log.cls}>{log.msg}</pre></td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
                </div>
            </div>);
    }
}