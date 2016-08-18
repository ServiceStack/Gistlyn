System.register(['react', 'react-dropzone'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React, react_dropzone_1;
    var ImageUploadDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            },
            function (react_dropzone_1_1) {
                react_dropzone_1 = react_dropzone_1_1;
            }],
        execute: function() {
            ImageUploadDialog = (function (_super) {
                __extends(ImageUploadDialog, _super);
                function ImageUploadDialog() {
                    _super.apply(this, arguments);
                }
                ImageUploadDialog.prototype.handleImageUrl = function () {
                    if (this.txtImageUrl && this.txtImageUrl.value.startsWith("http")) {
                        this.props.onChange(this.txtImageUrl.value);
                        this.props.onHide();
                        return;
                    }
                };
                ImageUploadDialog.prototype.handleDrop = function (files) {
                    var _this = this;
                    this.dialog.classList.add("disabled");
                    if (this.txtImageUrl)
                        this.txtImageUrl.disabled = true;
                    var uploadFiles = files.map(function (f) { return _this.uploadFile(f); });
                    Promise.all(uploadFiles)
                        .then(function () {
                        _this.dialog.classList.remove("disabled");
                        _this.props.onHide();
                    });
                };
                ImageUploadDialog.prototype.uploadFile = function (file) {
                    var _this = this;
                    var formData = new FormData();
                    formData.append('description', file.name + ' on http://gistlyn.com?gist=' + this.props.id);
                    formData.append('type', 'file');
                    formData.append('image', file);
                    return fetch('https://api.imgur.com/3/upload.json', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            Authorization: 'Client-ID c891e34185a353f'
                        },
                        body: formData
                    })
                        .then(function (r) {
                        if (r.status == 200 || r.status == 0) {
                            r.json().then(function (o) {
                                _this.props.onChange(o.data.link);
                            });
                        }
                        else {
                            alert("Error uploading Image: " + file.name);
                        }
                    });
                };
                ImageUploadDialog.prototype.render = function () {
                    var _this = this;
                    var hasSelectedImage = this.fileImage && this.fileImage.value;
                    var hasProvidedUrl = this.txtImageUrl && this.txtImageUrl.value.startsWith("http");
                    var disabledColor = { color: "#999" };
                    return (React.createElement("div", {id: "dialog", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {className: "dialog", ref: function (e) { return _this.props.dialogRef(_this.dialog = e); }, onClick: function (e) { return e.stopPropagation(); }}, React.createElement("div", {className: "dialog-header"}, React.createElement("i", {className: "material-icons close", onClick: function (e) { return _this.props.onHide(); }}, "close"), "Insert Image"), React.createElement("div", {className: "dialog-body"}, React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "txtImageUrl", style: hasSelectedImage ? disabledColor : null}, "Image URL"), React.createElement("input", {ref: function (e) { return _this.txtImageUrl = e; }, type: "text", id: "txtImageUrl", onKeyUp: function (e) { return _this.forceUpdate(); }, placeholder: "Enter the url you want to use", onKeyDown: function (e) { return e.keyCode == 13 && hasProvidedUrl ? e.preventDefault() || _this.handleImageUrl() : null; }, disabled: hasSelectedImage, autoFocus: true}), React.createElement("span", {className: "btn" + (hasSelectedImage || hasProvidedUrl ? "" : " disabled"), style: { padding: "6px 10px", marginLeft: 5, verticalAlign: "baseline" }, onClick: function (e) { return _this.handleImageUrl(); }}, hasSelectedImage ? "Upload to Imgur" : "Insert Image")), React.createElement("div", {className: "row"}, React.createElement(react_dropzone_1.default, {onDrop: function (files) { return _this.handleDrop(files); }, className: "dropzone", activeClassName: "dropzone-active", accept: "image/*"}, React.createElement("div", {className: "droparea"}, React.createElement("p", null, "Click or drag Images to upload to Imgur"), React.createElement("div", {className: "loading", style: { marginTop: 15 }}, React.createElement("span", {style: { display: "inline-block", color: "#888", marginRight: 10 }}, "Uploading to Imgur..."), React.createElement("img", {src: "/img/ajax-loader.gif", style: { margin: "5px 10px 0 0" }})))))))));
                };
                return ImageUploadDialog;
            }(React.Component));
            exports_1("default", ImageUploadDialog);
        }
    }
});
//# sourceMappingURL=ImageUploadDialog.js.map