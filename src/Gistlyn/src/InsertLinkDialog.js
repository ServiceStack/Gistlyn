System.register(['react', './utils', './state', './Gistlyn.dtos'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, utils_1, state_1, Gistlyn_dtos_1;
    var InsertLinkDialog, GistLinks;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (state_1_1) {
                state_1 = state_1_1;
            },
            function (Gistlyn_dtos_1_1) {
                Gistlyn_dtos_1 = Gistlyn_dtos_1_1;
            }],
        execute: function() {
            InsertLinkDialog = (function (_super) {
                __extends(InsertLinkDialog, _super);
                function InsertLinkDialog(props) {
                    _super.call(this, props);
                    this.state = { tab: null, gistTab: null, collectionTab: null };
                }
                InsertLinkDialog.prototype.selectTab = function (tab) {
                    this.setState({ tab: tab });
                };
                InsertLinkDialog.prototype.selectLink = function (e) {
                    if (!this.txtLinkLabel || !this.txtLinkUrl || !this.txtLinkUrl.value)
                        return;
                    e.preventDefault();
                    var url = this.txtLinkUrl.value;
                    if (url.indexOf(':') < 0 && ['com', 'net', 'org', 'io'].some(function (tld) { return url.indexOf('.' + tld) >= 0; })) {
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
                };
                InsertLinkDialog.prototype.handleCreateNewGist = function (id, authUsername) {
                    var _this = this;
                    this.dialog.classList.add("disabled");
                    var handleGistTemplate = function (gist) {
                        var request = new Gistlyn_dtos_1.StoreGist();
                        request.public = true;
                        request.description = _this.props.linkLabel || gist.meta.description;
                        request.files = utils_1.toGithubFiles(gist.files);
                        return utils_1.client.post(request)
                            .then(function (r) {
                            _this.dialog.classList.remove("disabled");
                            return r.gist;
                        });
                    };
                    var gist = state_1.getSavedGist(id);
                    if (!gist) {
                        return fetch(state_1.createGistRequest(authUsername, id))
                            .then(function (res) { return res.json(); })
                            .then(function (r) { return handleGistTemplate({ files: r.files, meta: state_1.createGistMeta(r) }); });
                    }
                    else {
                        return handleGistTemplate(gist);
                    }
                };
                InsertLinkDialog.prototype.handleGist = function (gistRef, createNew) {
                    var _this = this;
                    if (createNew) {
                        this.handleCreateNewGist(gistRef.id, this.props.authUsername)
                            .then(function (id) { return _this.props.onChange("?gist=" + id, _this.props.linkLabel || gistRef.description); });
                    }
                    else {
                        this.props.onChange("?gist=" + gistRef.id, this.props.linkLabel || gistRef.description);
                    }
                };
                InsertLinkDialog.prototype.handleCollection = function (gistRef, createNew) {
                    var _this = this;
                    if (createNew) {
                        this.handleCreateNewGist(gistRef.id, this.props.authUsername)
                            .then(function (id) { return _this.props.onChange("?collection=" + id, _this.props.linkLabel || gistRef.description); });
                    }
                    else {
                        var url = "?collection=" + gistRef.id;
                        this.props.onChange(url, this.props.linkLabel || gistRef.description);
                    }
                };
                InsertLinkDialog.prototype.render = function () {
                    var _this = this;
                    var tab = this.state.tab || "URL";
                    var gistTab = this.state.gistTab || "existing";
                    var tabNames = ["URL", "Gists", "Collections"];
                    var hasUrl = this.txtLinkUrl && this.txtLinkUrl.value;
                    var TabBody = null;
                    if (tab == "Gists") {
                        var newGist_1 = { id: utils_1.GistTemplates.NewGist, description: "New Public Gist", owner_login: "gistlyn" };
                        TabBody = (React.createElement("div", {className: "tab-body"}, React.createElement("div", {className: "row radiotabs"}, React.createElement("div", {onClick: function (e) { return _this.setState({ gistTab: "existing" }); }}, React.createElement("i", {className: "material-icons"}, gistTab == "existing" ? "radio_button_checked" : "radio_button_unchecked"), " Existing Gist"), React.createElement("div", {onClick: function (e) { return _this.setState({ gistTab: "new" }); }}, React.createElement("i", {className: "material-icons"}, gistTab == "new" ? "radio_button_checked" : "radio_button_unchecked"), " Create New Gist")), gistTab == "new"
                            ? (React.createElement("dl", {className: "insert-link-new"}, React.createElement("dt", null, "Select an existing Gist to use as Template"), React.createElement("dd", {onClick: function (e) { return _this.handleGist(newGist_1, true); }}, newGist_1.description)))
                            : null, React.createElement(GistLinks, {filter: function (x) { return !x.collection; }, onChange: function (gist) { return _this.handleGist(gist, gistTab == "new"); }, gistStats: this.props.gistStats, authUsername: this.props.authUsername, excludeGists: utils_1.GistTemplates.Gists})));
                    }
                    else if (tab == "Collections") {
                        var newGist_2 = { id: utils_1.GistTemplates.NewCollection, description: "New Collection", owner_login: "gistlyn" };
                        TabBody = (React.createElement("div", {className: "tab-body"}, React.createElement("div", {className: "row radiotabs"}, React.createElement("div", {onClick: function (e) { return _this.setState({ gistTab: "existing" }); }}, React.createElement("i", {className: "material-icons"}, gistTab == "existing" ? "radio_button_checked" : "radio_button_unchecked"), " Existing Collection"), React.createElement("div", {onClick: function (e) { return _this.setState({ gistTab: "new" }); }}, React.createElement("i", {className: "material-icons"}, gistTab == "new" ? "radio_button_checked" : "radio_button_unchecked"), " Create New Collection")), gistTab == "new"
                            ? (React.createElement("dl", {className: "insert-link-new"}, React.createElement("dt", null, "Select an existing Collection to use as Template"), React.createElement("dd", {onClick: function (e) { return _this.handleCollection(newGist_2, true); }}, newGist_2.description)))
                            : null, React.createElement(GistLinks, {filter: function (x) { return x.collection; }, onChange: function (gist) { return _this.handleCollection(gist, gistTab == "new"); }, gistStats: this.props.gistStats, authUsername: this.props.authUsername, excludeGists: utils_1.GistTemplates.Gists})));
                    }
                    else {
                        TabBody = (React.createElement("div", {className: "tab-body"}, React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "txtLinkUrl"}, "URL"), React.createElement("input", {ref: function (e) { return _this.txtLinkUrl = e; }, type: "text", id: "txtLinkUrl", onKeyUp: function (e) { return _this.forceUpdate(); }, onKeyDown: function (e) { return e.keyCode == 13 ? _this.selectLink(e) : null; }, placeholder: "Link URL", autoFocus: true})), React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "txtLinkLabel"}, "Label"), React.createElement("input", {ref: function (e) { return _this.txtLinkLabel = e; }, type: "text", id: "txtLinkLabel", defaultValue: this.props.linkLabel || "", onKeyUp: function (e) { return _this.forceUpdate(); }, onKeyDown: function (e) { return e.keyCode == 13 ? _this.selectLink(e) : null; }, placeholder: "Link Label (optional)"}))));
                    }
                    return (React.createElement("div", {id: "dialog", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {id: "insert-link-dialog", className: "dialog", ref: function (e) { return _this.props.dialogRef(_this.dialog = e); }, onClick: function (e) { return e.stopPropagation(); }}, React.createElement("div", {className: "dialog-header"}, React.createElement("i", {className: "material-icons close", onClick: function (e) { return _this.props.onHide(); }}, "close"), "Insert Link"), React.createElement("div", {className: "dialog-body"}, React.createElement("div", {className: "linktabs"}, tabNames.map(function (x) { return React.createElement("div", {className: x == tab ? "active" : "", onClick: function (e) { return _this.selectTab(x); }}, x); })), TabBody), React.createElement("div", {className: "dialog-footer"}, React.createElement("img", {className: "loading", src: "/img/ajax-loader.gif", style: { margin: "5px 10px 0 0" }}), tab == "URL"
                        ? (React.createElement("span", {className: "btn" + (hasUrl ? "" : " disabled"), onClick: function (e) { return _this.selectLink(e); }}, "Insert Link"))
                        : null))));
                };
                return InsertLinkDialog;
            }(React.Component));
            exports_1("default", InsertLinkDialog);
            GistLinks = (function (_super) {
                __extends(GistLinks, _super);
                function GistLinks(props) {
                    _super.call(this, props);
                    this.state = { filter: "" };
                }
                GistLinks.prototype.render = function () {
                    var _this = this;
                    var allGists = Object.keys(this.props.gistStats)
                        .map(function (k) { return _this.props.gistStats[k]; })
                        .filter(function (x) { return _this.props.excludeGists.indexOf(x.id) === -1; });
                    var sortByRecent = function (gists) {
                        gists.sort(function (a, b) { return b.date - a.date; });
                        return gists;
                    };
                    var removeDupes = function (xs) {
                        var dupes = {};
                        return xs.filter(function (x) { return dupes[x.description] ? false : !!(dupes[x.description] = x); });
                    };
                    var filter = this.state.filter;
                    var myGists = removeDupes(sortByRecent(allGists.filter(function (x) { return (!filter || x.description.toLowerCase().indexOf(filter.toLowerCase()) >= 0) &&
                        x.owner_login === _this.props.authUsername && _this.props.filter(x); })));
                    var recentGists = removeDupes(sortByRecent(allGists.filter(function (x) { return (!filter || x.description.toLowerCase().indexOf(filter.toLowerCase()) >= 0) &&
                        x.owner_login !== _this.props.authUsername && _this.props.filter(x); })));
                    return (React.createElement("div", {id: "gist-links"}, React.createElement("input", {type: "text", placeholder: "filter", onKeyUp: function (e) { return _this.setState({ filter: e.target.value }); }}), React.createElement("div", {className: "gist-links-body"}, myGists.length > 0
                        ? (React.createElement("div", {className: "my-gists"}, React.createElement("dl", null, React.createElement("dt", null, "My Gists"), myGists.map(function (x) { return React.createElement("dd", {onClick: function (e) { return _this.props.onChange(x); }}, x.description); }))))
                        : null, recentGists.length > 0 && false
                        ? (React.createElement("div", {className: "recent-gists"}, React.createElement("dl", null, React.createElement("dt", null, "Recent Gists"), recentGists.map(function (x) { return React.createElement("dd", {onClick: function (e) { return _this.props.onChange(x); }}, x.description); }))))
                        : null)));
                };
                return GistLinks;
            }(React.Component));
        }
    }
});
//# sourceMappingURL=InsertLinkDialog.js.map