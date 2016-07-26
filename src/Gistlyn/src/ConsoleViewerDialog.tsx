import * as React from 'react';

export default class ConsoleViewerDialog extends React.Component<any, any> {
    render() {
        return (<div id="dialog" className="console-viewer dark console" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div className="dialog" ref={e => this.props.dialogRef(e) } onClick={e => e.stopPropagation() }
                style={{ maxHeight: "90%", maxWidth: "90%", overflow:"auto", borderRadius:0 }}>
                <div className="dialog-header" style={{ margin: 0}}>
                    <i className="material-icons close" onClick={e => this.props.onHide() }>close</i>
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
            </div>
        </div>);
    }
} 