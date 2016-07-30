import * as React from 'react';
import { queryString } from 'servicestack-client';

export default class Collections extends React.Component<any, any> {
    render() {
        var LiveLists = null;
        if (this.props.showLiveLists) {
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

            var recentGists = removeDupes(sortByRecent(allGists.filter(x => !x.collection)));
            var recentCollections = removeDupes(sortByRecent(allGists.filter(x => x.collection)));
            var myGists = recentGists.filter(x => x.owner_login === this.props.authUsername);

            if (recentGists.length > 0 || recentCollections.length > 0) {
                LiveLists = (
                    <div  style={{ float: "right", margin: "4px 4px 0px 0px", padding: "0 0 5px 10px" }}>
                        <div id="livelist">
                            {recentCollections.length > 0
                                ? (<div>
                                    <h3>Recent Collections</h3>
                                    { recentCollections.slice(0, 5).map(x => <a href={`?collection=${x.id}`} title={x.description}>{x.description}</a>) }
                                </div>)
                                : null}

                            {recentGists.length > 0
                                ? (<div>
                                    <h3>Recent Gists</h3>
                                    { recentGists.slice(0, 5).map(x => <a href={`?gist=${x.id}`} title={x.description}>{x.description}</a>) }
                                </div>)
                                : null}

                            {myGists.length > 0
                                ? (<div>
                                    <h3>My Gists</h3>
                                    { myGists.slice(0, 20).map(x => <a href={`?gist=${x.id}`} title={x.description}>{x.description}</a>) }
                                </div>)
                                : null}
                        </div>
                    </div>);
            }
        }

        return (
            <div id="collection" className="section"
                onClick={e => {
                    var a = e.target as HTMLAnchorElement;
                    if (a && a.href) {
                        const qs = queryString(a.href);
                        if (qs["gist"] || qs["collection"]) {
                            e.preventDefault();
                            if (qs["gist"])
                                this.props.changeGist(qs["gist"], { activeFileName: qs["activeFileName"] });
                            if (qs["collection"])
                                this.props.changeCollection(qs["collection"], true);
                        }
                    }
                } }>
                <div id="collection-header">
                    <i id="btnHome" className="material-icons" onClick={e => this.props.onHome()} title="Home">home</i>
                    {this.props.collection.description || "Collections"}
                </div>
                <div id="collection-body">
                    {LiveLists}
                    <div id="markdown"
                        dangerouslySetInnerHTML={{ __html: this.props.collection.html }} />
                </div>
            </div>);
    }
}