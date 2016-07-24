import * as React from 'react';
import { splitOnFirst, combinePaths, appendQueryString } from './servicestack-client';

export default class AddServiceStackReferenceDialog extends React.Component<any, any> {
    txtBaseUrl: HTMLInputElement;
    txtFileName: HTMLInputElement;
    check: HTMLElement;

    constructor(props) {
        super(props);
        this.state = { value: "", valid: false, baseUrl: null, fileName: null, content: null, loading:false };
    }

    setValue(value: string) {
        this.setState({ value });

        var validUrl = (splitOnFirst(value, ".")[1] || "").length >= 2;
        if (validUrl) {
            //Enable CORS
            var url = value.indexOf("://") >= 0 ? value : "http://" + value;
            url = url.indexOf("/types/csharp") >= 0 ? url : combinePaths(url, "types/csharp");
            var baseUrl = url.replace("/types/csharp", "");
            url = appendQueryString(url, { ExcludeNamespace: true });
            var proxyUrl = appendQueryString("/proxy", { url });

            this.setState({ loading: true });

            fetch(proxyUrl)
                .then(r => {
                    if (!r.ok)
                        throw r;

                    r.text().then(content => {
                        var valid = content.trim().startsWith("/* Options:");
                        this.setState({ valid, baseUrl, content, loading:false });
                        setTimeout(() => this.txtFileName.select(), 0);
                    });
                })
                .catch(e => {
                    this.setState({ valid: false, loading: false });
                });
        }
        else {
            this.setState({ valid: false });
        }
    }

    render() {
        var value = this.state.value;

        return (<div id="dialog" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div className="dialog" ref={e => this.props.dialogRef(e) } onClick={e => e.stopPropagation() }>
                <div className="dialog-header">
                    <i className="material-icons close" onClick={e => this.props.onHide() }>close</i>
                    Add ServiceStack Reference
                </div>
                <div className="dialog-body">
                    <a href="https://github.com/ServiceStack/ServiceStack/wiki/CSharp-Add-ServiceStack-Reference" title="What's this?">
                        <i className="material-icons" style={{ float: "right" }}>help_outline</i>
                    </a>

                    <p style={{ margin: "0 0 20px 0", color: "#666", maxWidth: 500, lineHeight:"22px" }}>
                        Add the Base URL of a remote ServiceStack instance you want to generate the typed C# DTO's for, e.g: 
                        <span className="lnk" style={{ paddingLeft: 5 }} onClick={e => this.setValue("techstacks.io") }>techstacks.io</span>
                    </p>

                    <div className="row">
                        <label htmlFor="txtBaseUrl">Base Url</label>
                        <input ref={e => this.txtBaseUrl = e} type="text" id="txtBaseUrl" value={this.state.value}
                            onChange={ e => this.setValue((e.target as HTMLInputElement).value) }
                            onKeyDown={e => e.keyCode == 13 && value ? this.props.onAddReference(value) : null }
                            autoFocus placeholder="Url of remote ServiceStack Instance" />

                        <i className="material-icons"
                            style={{ visibility: value && !this.state.valid ? "visible" : "hidden", position: "absolute", color: "#c66", fontSize: 32, verticalAlign: "middle", margin: "0 0 0 5px" }}
                            title="Not a valid ServiceStack instance">close</i>

                        <i className="material-icons"
                            style={{ visibility: this.state.valid ? "visible" : "hidden", color: "#4CAF50", fontSize: 32, verticalAlign: "middle", margin: "0 0 0 5px" }}
                            title="Valid ServiceStack instance">check</i>

                        <img src="/img/ajax-loader.gif" style={{ display: this.state.loading ? "inline-block" : "none", margin: "0 0 0 -20px" }} />
                    </div>

                    <div className="row" style={{ visibility: this.state.valid ? "visible" : "hidden" }}>
                        <label htmlFor="txtFileName">Filename</label>
                        <input ref={e => this.txtFileName = e} type="text" id="txtFileName"
                            defaultValue="dtos.cs" style={{ width: "175px" }}
                            autoFocus placeholder="dtos.cs" />
                    </div>

                </div>
                <div className="dialog-footer">
                    <img className="loading" src="/img/ajax-loader.gif" style={{ margin: "5px 10px 0 0" }} />
                    <span className={"btn" + (this.state.valid ? "" : " disabled") }
                        onClick={e => this.state.valid ? this.props.onAddReference(this.state.baseUrl, this.txtFileName.value || "dtos.cs", this.state.content) : null }>
                        Add Reference
                    </span>
                </div>
            </div>
        </div>);
    }
} 