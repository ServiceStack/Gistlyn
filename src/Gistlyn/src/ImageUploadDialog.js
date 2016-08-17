System.register(['react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var ImageUploadDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            ImageUploadDialog = (function (_super) {
                __extends(ImageUploadDialog, _super);
                function ImageUploadDialog() {
                    _super.apply(this, arguments);
                }
                ImageUploadDialog.prototype.handleImageUpload = function () {
                    var _this = this;
                    if (this.txtImageUrl && this.txtImageUrl.value.startsWith("http")) {
                        this.props.onChange(this.txtImageUrl.value);
                        return;
                    }
                    var file = this.fileImage.files[0];
                    var formData = new FormData();
                    formData.append('description', 'http://gistlyn.com?gist=' + this.props.id);
                    formData.append('type', 'file');
                    formData.append('image', file);
                    this.dialog.classList.add("disabled");
                    fetch('https://api.imgur.com/3/upload.json', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            Authorization: 'Client-ID c891e34185a353f'
                        },
                        body: formData
                    })
                        .then(function (r) {
                        _this.dialog.classList.remove("disabled");
                        if (r.status == 200 || r.status == 0) {
                            r.json().then(function (o) {
                                _this.props.onChange(o.data.link);
                            });
                        }
                        else {
                            alert("Error uploading Image: ");
                        }
                    });
                };
                ImageUploadDialog.prototype.render = function () {
                    var _this = this;
                    var hasSelectedImage = this.fileImage && this.fileImage.value;
                    var hasProvidedUrl = this.txtImageUrl && this.txtImageUrl.value.startsWith("http");
                    var disabledColor = { color: "#999" };
                    return (React.createElement("div", {id: "dialog", onClick: function (e) { return _this.props.onHide(); }, onKeyDown: function (e) { return e.keyCode === 27 ? _this.props.onHide() : null; }}, React.createElement("div", {className: "dialog", ref: function (e) { return _this.props.dialogRef(_this.dialog = e); }, onClick: function (e) { return e.stopPropagation(); }}, React.createElement("div", {className: "dialog-header"}, React.createElement("i", {className: "material-icons close", onClick: function (e) { return _this.props.onHide(); }}, "close"), "Insert Image"), React.createElement("div", {className: "dialog-body"}, React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "txtImageUrl", style: hasSelectedImage ? disabledColor : null}, "Image URL"), React.createElement("input", {ref: function (e) { return _this.txtImageUrl = e; }, type: "text", id: "txtImageUrl", onKeyUp: function (e) { return _this.forceUpdate(); }, placeholder: "Enter the Image URL you want to use", onKeyDown: function (e) { return e.keyCode == 13 && hasProvidedUrl ? e.preventDefault() || _this.props.onChange(e.target.value) : null; }, disabled: hasSelectedImage, autoFocus: true})), React.createElement("div", {className: "row"}, React.createElement("label", {htmlFor: "fileImage", style: hasProvidedUrl ? disabledColor : null}, "Upload Image"), React.createElement("input", {ref: function (e) { return _this.fileImage = e; }, type: "file", id: "fileImage", onChange: function (e) { return _this.handleImageUpload(); }, style: { fontSize: 16 }, disabled: hasProvidedUrl}))), React.createElement("div", {className: "dialog-footer"}, React.createElement("img", {className: "loading", src: "/img/ajax-loader.gif", style: { margin: "5px 10px 0 0" }}), React.createElement("span", {className: "btn" + (hasSelectedImage || hasProvidedUrl ? "" : " disabled"), onClick: function (e) { return _this.handleImageUpload(); }}, hasSelectedImage ? "Upload to Imgur" : "Insert Image")))));
                };
                return ImageUploadDialog;
            }(React.Component));
            exports_1("default", ImageUploadDialog);
        }
    }
});
//# sourceMappingURL=ImageUploadDialog.js.map