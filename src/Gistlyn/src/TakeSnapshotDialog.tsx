import * as React from 'react';
import { JsonServiceClient } from 'servicestack-client';
import { StoreGist } from './Gistlyn.dtos';
import { GistTemplates } from './utils';

export default class TakeSnapshotDialog extends React.Component<any, any> {
    dialog: HTMLDivElement;
    txtDescription: HTMLInputElement;

    constructor(props) {
        super(props);
        this.state = { snapshotUrl: null, error:null };
    }

    onSave(opt) {
        const request = new StoreGist();
        const json = JSON.stringify(this.props.snapshot);
        request.files = {
            ["snapshot.json"]: { filename:"snapshot.json", content: json }
        };

        this.dialog.classList.add("disabled");

        const client = new JsonServiceClient("/");
        client.post(request)
            .then(r => {
                this.dialog.classList.remove("disabled");
                this.setState({ snapshotUrl: location.origin + `?snapshot=${r.gist}`, error:null });
            }).catch(e => {
                this.dialog.classList.remove("disabled");
                this.setState({ error: (e.status || {}).message });
            });
    }

    render() {
        var description = this.props.description;
        if (this.txtDescription) {
            description = this.txtDescription.value;
        } else {
            setTimeout(() => this.txtDescription.select(), 0);
        }
        var Body = [];

        if (!this.state.snapshotUrl) {
            Body.push([
                <div className="row">
                    <label htmlFor="txtDescription">Description</label>
                    <input ref={e => this.txtDescription = e} type="text" id="txtDescription"
                        defaultValue={ description }
                        onKeyUp={e => this.forceUpdate() }
                        onKeyDown={e => e.keyCode == 13 && description ? this.onSave({ description }) : null }
                        autoFocus />
                </div>,
                <div className="row">
                    <label></label>
                    <span className={"btn" + (description ? "" : " disabled") } style={{ fontSize: 14, padding: "4px 6px" }}
                        onClick={e => description ? this.onSave({ description }) : null }>
                        Save Snapshot
                    </span>
                    <img className="loading" src={require('./assets/img/ajax-loader.gif')} style={{ margin: "5px 0 0 10px" }} />
                </div>]);
        } else {
            setTimeout(() => this.txtDescription.select(), 0);
            Body.push([
                <div className="row">
                    <label>Snapshot Url</label>
                    <input ref={e => this.txtDescription = e} type="text" id="txtDescription" value={ this.state.snapshotUrl } autoFocus />
                </div>]);
        }

        if (this.state.error) {
            Body.push(<span style={{ color: "#c00" }}>{this.state.error}</span>);
        }

        return (<div id="dialog" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div className="dialog" ref={e => this.dialog = e } onClick={e => e.stopPropagation() }>
                <div className="dialog-header">
                    <i className="material-icons close" onClick={e => this.props.onHide() }>close</i>
                    Capture Snapshot
                </div>
                <div className="dialog-body">
                    <div className="row" style={{ textAlign:"right" }}>
                        <i className="material-icons info-help" onClick={e => this.props.urlChanged(GistTemplates.SnapshotsCollection) } title="What is this?">help_outline</i>
                    </div>

                    {Body}
                </div>
                <div className="dialog-footer">
                    <span onClick={e => this.props.onHide() } style={{ cursor: "pointer" }}>close</span>
                </div>
            </div>
        </div>);
    }
} 