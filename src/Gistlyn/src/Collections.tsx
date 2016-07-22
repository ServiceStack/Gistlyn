import * as React from 'react';
import { queryString } from './servicestack-client';

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
            var recentGists = sortByRecent(allGists.filter(x => !x.collection));
            var recentCollections = sortByRecent(allGists.filter(x => x.collection));
            var myGists = recentGists.filter(x => x.owner_login === this.props.authUsername);

            if (recentGists.length > 0 || recentCollections.length > 0) {
                LiveLists = (
                    <div  style={{ float: "right", margin: "0px -8px 0px 0px", padding: "0 0 5px 10px" }}>
                        <div id="livelist" style={{ boxShadow: "1px 2px 3px rgba(0, 0, 0, 0.3)" }}>
                            {recentCollections.length > 0
                                ? (<div>
                                    <h3>Recent Collections</h3>
                                    { recentCollections.slice(0, 10).map(x => <a href={`?collection=${x.id}`}>{x.description}</a>) }
                                </div>)
                                : null}

                            {recentGists.length > 0
                                ? (<div>
                                    <h3>Recent Gists</h3>
                                    { recentGists.slice(0, 10).map(x => <a href={`?gist=${x.id}`}>{x.description}</a>) }
                                </div>)
                                : null}

                            {myGists.length > 0
                                ? (<div>
                                    <h3>My Gists</h3>
                                    { myGists.slice(0, 30).map(x => <a href={`?gist=${x.id}`}>{x.description}</a>) }
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
                                this.props.changeGist(qs["gist"]);
                            else if (qs["collection"])
                                this.props.changeCollection(qs["collection"], true);
                        }
                    }
                } }>
                <table style={{ width: "100%" }}>
                    <thead>
                        <tr><th>{this.props.collection.description || "Collections"}</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {LiveLists}
                                <div id="markdown"
                                    dangerouslySetInnerHTML={{ __html: this.props.collection.html }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>);
    }
}