import * as React from 'react';
import { splitOnFirst, splitOnLast, queryString, combinePaths, appendQueryString } from '@servicestack/client';
import { GistTemplates } from "./utils";

export default class AddServiceStackReferenceDialog extends React.Component<any, any> {
    txtBaseUrl: HTMLInputElement;
    txtFileName: HTMLInputElement;
    check: HTMLElement;

    constructor(props) {
        super(props);
        const qs = queryString(location.href);
        var value = qs["AddServiceStackReference"] || "";
        var requestDto = qs["Request"];
        var autorun = !!qs["autorun"];
        this.state = { value, valid: false, baseUrl: null, fileName: null, content: null, loading: false, requestDto, autorun };

        if (value) {
            delete qs["AddServiceStackReference"];
            delete qs["Request"];
            delete qs["autorun"];
            var description = value + " API";
            history.replaceState({ id: GistTemplates.AddServiceStackReferenceGist, description },
                description, appendQueryString(splitOnFirst(location.href, '?')[0], qs));

            this.setValue(value);
        }
    }

    getFirstRequestDto(dtos) {
        var lines = dtos.split(/\r?\n/);
        for (var i = 0, len = lines.length; i < len; i++) {
            var line = lines[i];
            var isGetOnlyRoute = line.indexOf("[Route(") >= 0 && line.indexOf('"GET"') >= 0;
            if (isGetOnlyRoute)
                return splitOnLast(lines[i + 1], " ")[1];

            if (lines[i].indexOf(": IReturn<") >= 0) {
                var requestDto = splitOnLast(lines[i - 1], " ")[1];
                var name = requestDto.toLowerCase();
                if (name.startsWith("get") || name.startsWith("find") || name.startsWith("search"))
                    return requestDto;
            }
        }

        //Fallback to Route DTO with no Verb limiters
        for (var i = 0, len = lines.length; i < len; i++) {
            if (lines[i].indexOf("[Route(") >= 0 && lines[i].split('"').length === 3)
                return splitOnLast(lines[i + 1], " ")[1];
        }
        return null;
    }

    setValue(value: string) {
        this.setState({ value });

        var validUrl = (splitOnFirst(value, ".")[1] || "").length >= 2;
        if (validUrl) {
            //Enable CORS
            value = value.trim();
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
                        var requestDto = this.state.requestDto || this.getFirstRequestDto(content); 
                        this.setState({ valid, baseUrl, content, loading: false, requestDto });
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

    done() {
        this.props.onAddReference(
            this.state.baseUrl,
            this.txtFileName.value || "dtos.cs",
            this.state.content,
            this.state.requestDto || "RequestDto",
            this.state.autorun);
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
                    <div className="row" style={{ float: "right" }}>
                        <i className="material-icons info-help" onClick={e => this.props.urlChanged(GistTemplates.AddServiceStackReferenceCollection) } title="What is this?">help_outline</i>
                    </div>
                    
                    <p style={{ margin: "0 0 20px 0", color: "#666", maxWidth: 500, lineHeight:"22px" }}>
                        Add the Base URL of a remote ServiceStack instance you want to generate the typed C# DTO's for, e.g: 
                        <span className="lnk" style={{ paddingLeft: 5 }} onClick={e => this.setValue("techstacks.io") }>techstacks.io</span>
                    </p>

                    <div className="row">
                        <label htmlFor="txtBaseUrl">Base Url</label>
                        <input ref={e => this.txtBaseUrl = e} type="text" id="txtBaseUrl" value={this.state.value}
                            onChange={ e => this.setValue((e.target as HTMLInputElement).value) }
                            onKeyDown={e => e.keyCode == 13 ? this.setValue((e.target as HTMLInputElement).value) : null }
                            autoFocus placeholder="Url of remote ServiceStack Instance" />

                        <i className="material-icons"
                            style={{ visibility: value && !this.state.valid && !this.state.loading ? "visible" : "hidden", position: "absolute", color: "#c66", fontSize: 32, verticalAlign: "middle", margin: "0 0 0 5px" }}
                            title="Not a valid ServiceStack instance">close</i>

                        <i className="material-icons"
                            style={{ visibility: this.state.valid && !this.state.loading ? "visible" : "hidden", color: "#4CAF50", fontSize: 32, verticalAlign: "middle", margin: "0 0 0 5px" }}
                            title="Valid ServiceStack instance">check</i>

                        <div>
                            <img src={require('./assets/img/ajax-loader.gif')} style={{ display: this.state.loading ? "inline-block" : "none", margin: "10px 0 0 -20px" }} />
                        </div>
                    </div>

                    <div className="row" style={{ visibility: this.state.valid ? "visible" : "hidden" }}>
                        <label htmlFor="txtFileName">Filename</label>
                        <input ref={e => this.txtFileName = e} type="text" id="txtFileName"
                            onKeyDown={e => e.keyCode == 13 && this.state.valid ? this.done() : null }
                            defaultValue="dtos.cs" style={{ width: "175px" }}
                            autoFocus placeholder="dtos.cs" />
                    </div>

                </div>
                <div className="dialog-footer">
                    <img className="loading" src={require('./assets/img/ajax-loader.gif')} style={{ margin: "5px 10px 0 0" }} />
                    <span className={"btn" + (this.state.valid ? "" : " disabled") }
                        onClick={e => this.state.valid ? this.done() : null }>
                        Add Reference
                    </span>
                </div>
            </div>
        </div>);
    }
} 