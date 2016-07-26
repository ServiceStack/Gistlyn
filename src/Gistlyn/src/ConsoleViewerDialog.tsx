import * as React from 'react';

export default class ConsoleViewerDialog extends React.Component<any, any> {
    dialog: HTMLDivElement;

    render() {
        setTimeout(() => this.dialog.scrollTop = this.dialog.scrollHeight, 0);

        return (<div id="dialog" className="console-viewer dark console" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div className="dialog" ref={e => this.props.dialogRef(this.dialog = e) } onClick={e => e.stopPropagation() }
                style={{ maxHeight: "90%", maxWidth: "90%", overflow: "auto", borderRadius: 0 }}>
                <div className="dialog-header" style={{ margin: 0 }}>
                    <span onClick={e => this.props.onHide() }>close</span>
                    <span onClick={e => this.dialog.scrollTop = this.dialog.scrollHeight}>scroll down</span>
                    <span onClick={e => this.props.onClear() }>clear</span>
                    Console Logs
                </div>
                <div className="dialog-body"
                    style={{ padding: 10 }}>
                    <table style={{ width: "100%" }} className="console">
                        <tbody>
                            {this.props.logs.map(log => (
                                <tr>
                                    <td style={{ padding: "2px 8px", tabSize: 4 }}><pre className={log.cls}>{log.msg}</pre></td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
                </div>
                <div className="dialog-footer">
                    <p style={{ paddingBottom: 15 }}>
                        <span onClick={e => this.props.onHide() }>close</span>
                        <span onClick={e => this.dialog.scrollTop = 0}>scroll up</span>
                    </p>
                </div>
            </div>
        </div>);
    }
} 