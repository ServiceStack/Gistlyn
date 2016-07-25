System.register(['react', './servicestack-client', "./utils"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, servicestack_client_1, utils_1;
    var AddServiceStackReferenceDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            AddServiceStackReferenceDialog = (function (_super) {
                __extends(AddServiceStackReferenceDialog, _super);
                function AddServiceStackReferenceDialog(props) {
                    _super.call(this, props);
                    var qs = servicestack_client_1.queryString(location.href);
                    var value = qs["AddServiceStackReference"] || "";
                    var requestDto = qs["Request"];
                    var autorun = !!qs["autorun"];
                    this.state = { value: value, valid: false, baseUrl: null, fileName: null, content: null, loading: false, requestDto: requestDto, autorun: autorun };
                    if (value) {
                        delete qs["AddServiceStackReference"];
                        delete qs["Request"];
                        delete qs["autorun"];
                        var description = value + " API";
                        history.replaceState({ id: utils_1.GistTemplates.AddServiceStackReferenceGist, description: description }, description, servicestack_client_1.appendQueryString(servicestack_client_1.splitOnFirst(location.href, '?')[0], qs));
                        this.setValue(value);
                    }
                }
                AddServiceStackReferenceDialog.prototype.getFirstRequestDto = function (dtos) {
                    var lines = dtos.split(/\r?\n/);
                    for (var i = 0, len = lines.length; i < len; i++) {
                        var line = lines[i];
                        var isGetOnlyRoute = line.indexOf("[Route(") >= 0 && line.indexOf('"GET"') >= 0;
                        if (isGetOnlyRoute)
                            return servicestack_client_1.splitOnLast(lines[i + 1], " ")[1];
                        if (lines[i].indexOf(": IReturn<") >= 0) {
                            var requestDto = servicestack_client_1.splitOnLast(lines[i - 1], " ")[1];
                            var name = requestDto.toLowerCase();
                            if (name.startsWith("get") || name.startsWith("find") || name.startsWith("search"))
                                return requestDto;
                        }
                    }
                    //Fallback to Route DTO with no Verb limiters
                    for (var i = 0, len = lines.length; i < len; i++) {
                        if (lines[i].indexOf("[Route(") >= 0 && lines[i].split('"').length === 3)
                            return servicestack_client_1.splitOnLast(lines[i + 1], " ")[1];
                    }
                    return null;
                };
                AddServiceStackReferenceDialog.prototype.setValue = function (value) {
                    var _this = this;
                    this.setState({ value: value });
                    var validUrl = (servicestack_client_1.splitOnFirst(value, ".")[1] || "").length >= 2;
                    if (validUrl) {
                        //Enable CORS
                        value = value.trim();
                        var url = value.indexOf("://") >= 0 ? value : "http://" + value;
                        url = url.indexOf("/types/csharp") >= 0 ? url : servicestack_client_1.combinePaths(url, "types/csharp");
                        var baseUrl = url.replace("/types/csharp", "");
                        url = servicestack_client_1.appendQueryString(url, { ExcludeNamespace: true });
                        var proxyUrl = servicestack_client_1.appendQueryString("/proxy", { url: url });
                        this.setState({ loading: true });
                        fetch(proxyUrl)
                            .then(function (r) {
                            if (!r.ok)
                                throw r;
                            r.text().then(function (content) {
                                var valid = content.trim().startsWith("/* Options:");
                                var requestDto = _this.state.requestDto || _this.getFirstRequestDto(content);
                                _this.setState({ valid: valid, baseUrl: baseUrl, content: content, loading: false, requestDto: requestDto });
                                setTimeout(function () { return _this.txtFileName.select(); }, 0);
                            });
                        })
                            .catch(function (e) {
                            _this.setState({ valid: false, loading: false });
                        });
                    }
                    else {
                        this.setState({ valid: false });
                    }
                };
                AddServiceStackReferenceDialog.prototype.done = function () {
                    this.props.onAddReference(this.state.baseUrl, this.txtFileName.value || "dtos.cs", this.state.content, this.state.requestDto || "RequestDto", this.state.autorun);
                };
                AddServiceStackReferenceDialog.prototype.render = function () {
                    var _this = this;
                    var value = this.state.value;
                    return (React.createElement("div", {id: "dialog", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {className: "dialog", ref: function (e) { return _this.props.dialogRef(e); }, onClick: function (e) { return e.stopPropagation(); }}, React.createElement("div", {className: "dialog-header"}, React.createElement("i", {className: "material-icons close", onClick: function (e) { return _this.props.onHide(); }}, "close"), "Add ServiceStack Reference"), React.createElement("div", {className: "dialog-body"}, React.createElement("a", {href: "https://github.com/ServiceStack/ServiceStack/wiki/CSharp-Add-ServiceStack-Reference", title: "What is this?"}, React.createElement("i", {className: "material-icons", style: { float: "right" }}, "help_outline")), React.createElement("p", {style: { margin: "0 0 20px 0", color: "#666", maxWidth: 500, lineHeight: "22px" }}, "Add the Base URL of a remote ServiceStack instance you want to generate the typed C# DTO's for, e.g:", React.createElement("span", {className: "lnk", style: { paddingLeft: 5 }, onClick: function (e) { return _this.setValue("techstacks.io"); }}, "techstacks.io")), React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "txtBaseUrl"}, "Base Url"), React.createElement("input", {ref: function (e) { return _this.txtBaseUrl = e; }, type: "text", id: "txtBaseUrl", value: this.state.value, onChange: function (e) { return _this.setValue(e.target.value); }, onKeyDown: function (e) { return e.keyCode == 13 ? _this.setValue(e.target.value) : null; }, autoFocus: true, placeholder: "Url of remote ServiceStack Instance"}), React.createElement("i", {className: "material-icons", style: { visibility: value && !this.state.valid && !this.state.loading ? "visible" : "hidden", position: "absolute", color: "#c66", fontSize: 32, verticalAlign: "middle", margin: "0 0 0 5px" }, title: "Not a valid ServiceStack instance"}, "close"), React.createElement("i", {className: "material-icons", style: { visibility: this.state.valid && !this.state.loading ? "visible" : "hidden", color: "#4CAF50", fontSize: 32, verticalAlign: "middle", margin: "0 0 0 5px" }, title: "Valid ServiceStack instance"}, "check"), React.createElement("img", {src: "/img/ajax-loader.gif", style: { display: this.state.loading ? "inline-block" : "none", margin: "0 0 0 -20px" }})), React.createElement("div", {className: "row", style: { visibility: this.state.valid ? "visible" : "hidden" }}, React.createElement("label", {htmlFor: "txtFileName"}, "Filename"), React.createElement("input", {ref: function (e) { return _this.txtFileName = e; }, type: "text", id: "txtFileName", onKeyDown: function (e) { return e.keyCode == 13 && _this.state.valid ? _this.done() : null; }, defaultValue: "dtos.cs", style: { width: "175px" }, autoFocus: true, placeholder: "dtos.cs"}))), React.createElement("div", {className: "dialog-footer"}, React.createElement("img", {className: "loading", src: "/img/ajax-loader.gif", style: { margin: "5px 10px 0 0" }}), React.createElement("span", {className: "btn" + (this.state.valid ? "" : " disabled"), onClick: function (e) { return _this.state.valid ? _this.done() : null; }}, "Add Reference")))));
                };
                return AddServiceStackReferenceDialog;
            }(React.Component));
            exports_1("default", AddServiceStackReferenceDialog);
        }
    }
});
//# sourceMappingURL=AddServiceStackReferenceDialog.js.map