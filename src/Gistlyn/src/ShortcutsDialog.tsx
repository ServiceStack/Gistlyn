import * as React from 'react';

export default class ShortcutsDialog extends React.Component<any, any> {
    render() {
        return (<div id="dialog" className="shortcuts dark" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div className="dialog" ref={e => this.props.dialogRef(e) } onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <i className="material-icons close" onClick={e => this.props.onHide() }>close</i>
                    Keyboard shortcuts
                </div>
                <div className="dialog-body">
                    <table>
                        <tbody>
                            <tr>
                                <td></td>
                                <td><h4>Editor Shortcuts</h4></td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Ctrl&gt;</b>
                                    <span> + </span>
                                    <b>&lt;Enter&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Run
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Ctrl&gt;</b>
                                    <span> + </span>
                                    <b>&lt;S&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Save
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;F11&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Toggle Full Screen
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Esc&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Exit Full Screen
                                </td>
                            </tr>

                            <tr>
                                <td></td>
                                <td><h4>Application Shortcuts</h4></td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Alt&gt;</b>
                                    <span> + </span>
                                    <b>&lt;S&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Take Snapshot
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Alt&gt;</b>
                                    <span> + </span>
                                    <b>&lt;C&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Console Viewer
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Ctrl&gt;</b>
                                    <span> + </span>
                                    <b>&lt;Left&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Go to Previous tab
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Ctrl&gt;</b>
                                    <span> + </span>
                                    <b>&lt;Right&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Go to Next tab
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <span> ? </span>
                                    <i>:</i>
                                </th>
                                <td>
                                    Open keyboard shortcut dialog
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <b>&lt;Esc&gt;</b>
                                    <i>:</i>
                                </th>
                                <td>
                                    Close dialog
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
    }
} 