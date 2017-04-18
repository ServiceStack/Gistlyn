import * as React from 'react';
import { client, IGistRef, IGistSaved, GistTemplates, GistCacheKey, toGithubFiles } from './utils';
import { createGistRequest, createGistMeta, getSavedGist } from './state';
import { StoreGist, GithubFile } from './Gistlyn.dtos';

export default class InsertLinkDialog extends React.Component<any, any> {
    dialog: HTMLDivElement;
    txtLinkUrl: HTMLInputElement;
    txtLinkLabel: HTMLInputElement;
    
    constructor(props) {
        super(props);
        this.state = { tab: null, gistTab: null, collectionTab: null };
    }

    selectTab(tab:string) {
        this.setState({ tab });
    }

    selectLink(e) {
        if (!this.txtLinkLabel || !this.txtLinkUrl || !this.txtLinkUrl.value)
            return;

        e.preventDefault();

        var url = this.txtLinkUrl.value;
        if (url.indexOf(':') < 0 && ['com','net','org','io'].some(tld => url.indexOf('.' + tld) >= 0)) {
            url = "http://" + url;
        }
        var pos = url.indexOf("gistlyn.com"); //strip gistlyn.com so url works in all Gistlyn versions
        if (pos >= 0) {
            url = url.substring(pos + "gistlyn.com".length);
        }
        pos = url.indexOf("localhost:4000");
        if (pos >= 0) {
            url = url.substring(pos + "localhost:4000".length);
        }
        if (url.startsWith("/?")) {
            url = url.substring(1);
        }

        this.props.onChange(url, this.txtLinkLabel.value);
    }

    handleCreateNewGist(id:string, authUsername:string) : Promise<string> {
        this.dialog.classList.add("disabled");

        const handleGistTemplate = (gist:IGistSaved) => {
            const request = new StoreGist();
            request.public = true;
            request.description = this.props.linkLabel || gist.meta.description;
            request.files = toGithubFiles(gist.files);

            return client.post(request)
                .then(r => {
                    this.dialog.classList.remove("disabled");
                    return r.gist;
                });
        };
        const gist = getSavedGist(id);
        if (!gist) {
            return fetch(createGistRequest(authUsername, id))
                .then(res => res.json())
                .then((r:any) => handleGistTemplate({ files: r.files, meta: createGistMeta(r) }));
        } else {
            return handleGistTemplate(gist);
        }
    }

    handleGist(gistRef:IGistRef, createNew:boolean) {
        if (createNew) {
            this.handleCreateNewGist(gistRef.id, this.props.authUsername)
                .then(id => this.props.onChange("?gist=" + id, this.props.linkLabel || gistRef.description));
        } else {
            this.props.onChange("?gist=" + gistRef.id, this.props.linkLabel || gistRef.description);
        }
    }

    handleCollection(gistRef:IGistRef, createNew:boolean) {
        if (createNew) {
            this.handleCreateNewGist(gistRef.id, this.props.authUsername)
                .then(id => this.props.onChange("?collection=" + id, this.props.linkLabel || gistRef.description));
        } else {
            const url = "?collection=" + gistRef.id;
            this.props.onChange(url, this.props.linkLabel || gistRef.description);
        }
    }

    render() {
        const tab = this.state.tab || "URL";
        const gistTab = this.state.gistTab || "existing";
        const tabNames = ["URL", "Gists", "Collections"];
        const hasUrl = this.txtLinkUrl && this.txtLinkUrl.value;
        
        var TabBody = null;

        if (tab == "Gists") {
            const newGist = {id:GistTemplates.NewGist, description:"New Public Gist", owner_login:"gistlyn"};
            TabBody = (
                <div className="tab-body">
                    <div className="row radiotabs">
                        <div onClick={e => this.setState({gistTab:"existing"})}><i className="material-icons">{gistTab == "existing" ? "radio_button_checked" : "radio_button_unchecked"}</i> Existing Gist</div>
                        <div onClick={e => this.setState({gistTab:"new"})}><i className="material-icons">{gistTab == "new" ? "radio_button_checked" : "radio_button_unchecked"}</i> Create New Gist</div>
                    </div>
                    {gistTab == "new"
                        ? (<dl className="insert-link-new">
                            <dt>Select an existing Gist to use as Template</dt>
                            <dd onClick={e => this.handleGist(newGist, true)}>{newGist.description}</dd>
                           </dl>)
                        : null}
                    <GistLinks filter={x => !x.collection} onChange={gist => this.handleGist(gist, gistTab == "new")}
                        gistStats={this.props.gistStats} authUsername={this.props.authUsername} excludeGists={GistTemplates.Gists} />
                </div>
            );
        } else if (tab == "Collections") {
            const newGist = {id:GistTemplates.NewCollection, description:"New Collection", owner_login:"gistlyn"};
            TabBody = (
                <div className="tab-body">
                    <div className="row radiotabs">
                        <div onClick={e => this.setState({gistTab:"existing"})}><i className="material-icons">{gistTab == "existing" ? "radio_button_checked" : "radio_button_unchecked"}</i> Existing Collection</div>
                        <div onClick={e => this.setState({gistTab:"new"})}><i className="material-icons">{gistTab == "new" ? "radio_button_checked" : "radio_button_unchecked"}</i> Create New Collection</div>
                    </div>
                    {gistTab == "new"
                        ? (<dl className="insert-link-new">
                            <dt>Select an existing Collection to use as Template</dt>
                            <dd onClick={e => this.handleCollection(newGist, true)}>{newGist.description}</dd>
                           </dl>)
                        : null}
                    <GistLinks filter={x => x.collection} onChange={gist => this.handleCollection(gist, gistTab == "new")}
                        gistStats={this.props.gistStats} authUsername={this.props.authUsername} excludeGists={GistTemplates.Gists} />
                </div>
            );
        } else {
            TabBody = (
                <div className="tab-body">
                    <div className="row">
                        <label htmlFor="txtLinkUrl">URL</label>
                        <input ref={e => this.txtLinkUrl = e} type="text" id="txtLinkUrl"
                            onKeyUp={e => this.forceUpdate() }
                            onKeyDown={e => e.keyCode == 13 ? this.selectLink(e) : null}
                            placeholder="Link URL" 
                            autoFocus />
                    </div>
                    <div className="row">
                        <label htmlFor="txtLinkLabel">Label</label>
                        <input ref={e => this.txtLinkLabel = e} type="text" id="txtLinkLabel"
                            defaultValue={this.props.linkLabel || ""}
                            onKeyUp={e => this.forceUpdate() }
                            onKeyDown={e => e.keyCode == 13 ? this.selectLink(e) : null}
                            placeholder="Link Label (optional)" />
                    </div>
                </div>
            );
        }

        return (<div id="dialog" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div id="insert-link-dialog" className="dialog" ref={e => this.props.dialogRef(this.dialog = e) } onClick={e => e.stopPropagation() }>
                <div className="dialog-header">
                    <i className="material-icons close" onClick={e => this.props.onHide() }>close</i>
                    Insert Link
                </div>
                <div className="dialog-body">
                    <div className="linktabs">
                        {tabNames.map(x => <div className={x == tab ? "active": ""} onClick={e => this.selectTab(x)}>{x}</div>)}
                    </div>
                    {TabBody}
                </div>
                <div className="dialog-footer">
                    <img className="loading" src="/img/ajax-loader.gif" style={{ margin: "5px 10px 0 0" }} />

                    {tab == "URL" 
                        ? (<span className={"btn" + (hasUrl ? "" : " disabled")} onClick={e => this.selectLink(e)}>
                               Insert Link
                           </span>)
                        : null}
                </div>
            </div>
        </div>);
    }
} 

class GistLinks extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = { filter:"" };
    }

    render() {
        const allGists = Object.keys(this.props.gistStats)
            .map(k => this.props.gistStats[k])
            .filter(x => this.props.excludeGists.indexOf(x.id) === -1);

        const sortByRecent = gists => {
            gists.sort((a, b) => b.date - a.date);
            return gists;
        };
        const removeDupes = xs => {
            var dupes = {};
            return xs.filter(x => dupes[x.description] ? false : !!(dupes[x.description] = x));
        };

        const filter = this.state.filter;

        var myGists = removeDupes(sortByRecent(allGists.filter(x => (!filter || x.description.toLowerCase().indexOf(filter.toLowerCase()) >= 0) && 
            x.owner_login === this.props.authUsername && this.props.filter(x))));

        var recentGists = removeDupes(sortByRecent(allGists.filter(x => (!filter || x.description.toLowerCase().indexOf(filter.toLowerCase()) >= 0) && 
            x.owner_login !== this.props.authUsername && this.props.filter(x))));

        return (
            <div id="gist-links">                
                <input type="text" placeholder="filter" onKeyUp={e => this.setState({filter:(e.target as HTMLInputElement).value})} />

                <div className="gist-links-body">
                    {myGists.length > 0
                        ? (<div className="my-gists">
                                <dl>
                                    <dt>My Gists</dt>
                                    {myGists.map(x => <dd onClick={e => this.props.onChange(x)}>{x.description}</dd>)}
                                </dl>
                           </div>)
                        : null}

                    {recentGists.length > 0
                        ? (<div className="recent-gists">
                                <dl>
                                    <dt>Recent Gists</dt>
                                    {recentGists.map(x => <dd onClick={e => this.props.onChange(x)}>{x.description}</dd>)}
                                </dl>
                           </div>)
                        : null}
                </div>
            </div>);
    }
}