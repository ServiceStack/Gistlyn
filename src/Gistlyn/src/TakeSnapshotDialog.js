System.register(['react', 'servicestack-client', './Gistlyn.dtos', './utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, servicestack_client_1, Gistlyn_dtos_1, utils_1;
    var TakeSnapshotDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            },
            function (Gistlyn_dtos_1_1) {
                Gistlyn_dtos_1 = Gistlyn_dtos_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            TakeSnapshotDialog = (function (_super) {
                __extends(TakeSnapshotDialog, _super);
                function TakeSnapshotDialog(props) {
                    _super.call(this, props);
                    this.state = { snapshotUrl: null, error: null };
                }
                TakeSnapshotDialog.prototype.onSave = function (opt) {
                    var _this = this;
                    var request = new Gistlyn_dtos_1.StoreGist();
                    var json = JSON.stringify(this.props.snapshot);
                    request.files = (_a = {},
                        _a["snapshot.json"] = { filename: "snapshot.json", content: json },
                        _a
                    );
                    this.dialog.classList.add("disabled");
                    var client = new servicestack_client_1.JsonServiceClient("/");
                    client.post(request)
                        .then(function (r) {
                        _this.dialog.classList.remove("disabled");
                        _this.setState({ snapshotUrl: location.origin + ("?snapshot=" + r.gist), error: null });
                    }).catch(function (e) {
                        _this.dialog.classList.remove("disabled");
                        _this.setState({ error: (e.status || {}).message });
                    });
                    var _a;
                };
                TakeSnapshotDialog.prototype.render = function () {
                    var _this = this;
                    var description = this.props.description;
                    if (this.txtDescription) {
                        description = this.txtDescription.value;
                    }
                    else {
                        setTimeout(function () { return _this.txtDescription.select(); }, 0);
                    }
                    var Body = [];
                    if (!this.state.snapshotUrl) {
                        Body.push([
                            React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "txtDescription"}, "Description"), React.createElement("input", {ref: function (e) { return _this.txtDescription = e; }, type: "text", id: "txtDescription", defaultValue: description, onKeyUp: function (e) { return _this.forceUpdate(); }, onKeyDown: function (e) { return e.keyCode == 13 && description ? _this.onSave({ description: description }) : null; }, autoFocus: true})),
                            React.createElement("div", {className: "row"}, React.createElement("label", null), React.createElement("span", {className: "btn" + (description ? "" : " disabled"), style: { fontSize: 14, padding: "4px 6px" }, onClick: function (e) { return description ? _this.onSave({ description: description }) : null; }}, "Save Snapshot"), React.createElement("img", {className: "loading", src: "/img/ajax-loader.gif", style: { margin: "5px 0 0 10px" }}))]);
                    }
                    else {
                        setTimeout(function () { return _this.txtDescription.select(); }, 0);
                        Body.push([
                            React.createElement("div", {className: "row"}, React.createElement("label", null, "Snapshot Url"), React.createElement("input", {ref: function (e) { return _this.txtDescription = e; }, type: "text", id: "txtDescription", value: this.state.snapshotUrl, autoFocus: true}))]);
                    }
                    if (this.state.error) {
                        Body.push(React.createElement("span", {style: { color: "#c00" }}, this.state.error));
                    }
                    return (React.createElement("div", {id: "dialog", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {className: "dialog", ref: function (e) { return _this.dialog = e; }, onClick: function (e) { return e.stopPropagation(); }}, React.createElement("div", {className: "dialog-header"}, React.createElement("i", {className: "material-icons close", onClick: function (e) { return _this.props.onHide(); }}, "close"), "Capture Snapshot"), React.createElement("div", {className: "dialog-body"}, React.createElement("div", {className: "row", style: { textAlign: "right" }}, React.createElement("i", {className: "material-icons info-help", onClick: function (e) { return _this.props.urlChanged(utils_1.GistTemplates.SnapshotsCollection); }, title: "What is this?"}, "help_outline")), Body), React.createElement("div", {className: "dialog-footer"}, React.createElement("span", {onClick: function (e) { return _this.props.onHide(); }, style: { cursor: "pointer" }}, "close")))));
                };
                return TakeSnapshotDialog;
            }(React.Component));
            exports_1("default", TakeSnapshotDialog);
        }
    }
});
//# sourceMappingURL=TakeSnapshotDialog.js.map