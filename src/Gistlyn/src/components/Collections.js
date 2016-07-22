System.register(['react', '../servicestack-client'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, servicestack_client_1;
    var Collections;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            }],
        execute: function() {
            Collections = (function (_super) {
                __extends(Collections, _super);
                function Collections() {
                    _super.apply(this, arguments);
                }
                Collections.prototype.render = function () {
                    var _this = this;
                    var LiveLists = null;
                    if (this.props.showLiveLists) {
                        var allGists = Object.keys(this.props.gistStats)
                            .map(function (k) { return _this.props.gistStats[k]; })
                            .filter(function (x) { return _this.props.excludeGists.indexOf(x.id) === -1; });
                        var sortByRecent = function (gists) {
                            gists.sort(function (a, b) { return b.date - a.date; });
                            return gists;
                        };
                        var recentGists = sortByRecent(allGists.filter(function (x) { return !x.collection; }));
                        var recentCollections = sortByRecent(allGists.filter(function (x) { return x.collection; }));
                        var myGists = recentGists.filter(function (x) { return x.owner_login === _this.props.authUsername; });
                        if (recentGists.length > 0 || recentCollections.length > 0) {
                            LiveLists = (React.createElement("div", {style: { float: "right", margin: "0px -8px 0px 0px", padding: "0 0 5px 10px" }}, React.createElement("div", {id: "livelist", style: { boxShadow: "1px 2px 3px rgba(0, 0, 0, 0.3)" }}, recentCollections.length > 0
                                ? (React.createElement("div", null, React.createElement("h3", null, "Recent Collections"), recentCollections.slice(0, 10).map(function (x) { return React.createElement("a", {href: "?collection=" + x.id}, x.description); })))
                                : null, recentGists.length > 0
                                ? (React.createElement("div", null, React.createElement("h3", null, "Recent Gists"), recentGists.slice(0, 10).map(function (x) { return React.createElement("a", {href: "?gist=" + x.id}, x.description); })))
                                : null, myGists.length > 0
                                ? (React.createElement("div", null, React.createElement("h3", null, "My Gists"), myGists.slice(0, 30).map(function (x) { return React.createElement("a", {href: "?gist=" + x.id}, x.description); })))
                                : null)));
                        }
                    }
                    return (React.createElement("div", {id: "collection", className: "section", onClick: function (e) {
                        var a = e.target;
                        if (a && a.href) {
                            var qs = servicestack_client_1.queryString(a.href);
                            if (qs["gist"] || qs["collection"]) {
                                e.preventDefault();
                                if (qs["gist"])
                                    _this.props.changeGist(qs["gist"]);
                                else if (qs["collection"])
                                    _this.props.changeCollection(qs["collection"], true);
                            }
                        }
                    }}, React.createElement("table", {style: { width: "100%" }}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, this.props.collection.description || "Collections"))), React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, LiveLists, React.createElement("div", {id: "markdown", dangerouslySetInnerHTML: { __html: this.props.collection.html }})))))));
                };
                return Collections;
            }(React.Component));
            exports_1("default", Collections);
        }
    }
});
//# sourceMappingURL=Collections.js.map