import * as React from 'react';
import DropZone from 'react-dropzone';

export default class ImageUploadDialog extends React.Component<any, any> {
    dialog: HTMLDivElement;
    fileImage: HTMLInputElement;
    txtImageUrl: HTMLInputElement;

    handleImageUrl() {
        if (this.txtImageUrl && this.txtImageUrl.value.startsWith("http")) {
            this.props.onChange(this.txtImageUrl.value);
            this.props.onHide();
            return;
        }
    }

    handleDrop(files:File[]) {
        this.dialog.classList.add("disabled");
        if (this.txtImageUrl) this.txtImageUrl.disabled = true;

        var uploadFiles = files.map(f => this.uploadFile(f));
        Promise.all(uploadFiles)
            .then(() => {
                this.dialog.classList.remove("disabled");
                this.props.onHide();
            });
    }

    uploadFile(file: File) {
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
            .then(r => {
                if (r.status == 200 || r.status == 0) {
                    r.json().then(o => {
                        this.props.onChange(o.data.link);
                    });
                } else {
                    alert("Error uploading Image: " + file.name);
                }
            });
    }

    render() {
        const hasSelectedImage = this.fileImage && this.fileImage.value;
        const hasProvidedUrl = this.txtImageUrl && this.txtImageUrl.value.startsWith("http");
        const disabledColor = {color:"#999"};

        return (<div id="dialog" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div className="dialog" ref={e => this.props.dialogRef(this.dialog = e) } onClick={e => e.stopPropagation() }>
                <div className="dialog-header">
                    <i className="material-icons close" onClick={e => this.props.onHide() }>close</i>
                    Insert Image
                </div>
                <div className="dialog-body">
                    <div className="row">
                        <label htmlFor="txtImageUrl" style={hasSelectedImage ? disabledColor : null}>Image URL</label>
                        <input ref={e => this.txtImageUrl = e} type="text" id="txtImageUrl"
                            onKeyUp={e => this.forceUpdate() }
                            placeholder="Enter the url you want to use"
                            onKeyDown={e => e.keyCode == 13 && hasProvidedUrl ? e.preventDefault() || this.handleImageUrl() : null }
                            disabled={hasSelectedImage} autoFocus />
                        <span className={"btn" + (hasSelectedImage || hasProvidedUrl ? "" : " disabled") }
                              style={{ padding: "6px 10px", marginLeft: 5, verticalAlign:"baseline" }}
                              onClick={e => this.handleImageUrl() }>
                            {hasSelectedImage ? "Upload to Imgur" : "Insert Image"}
                        </span>
                    </div>
                    <div className="row">
                        <DropZone onDrop={files => this.handleDrop(files) }
                            className="dropzone" activeClassName="dropzone-active" accept="image/*">
                            <div className="droparea">
                                <p>Click or drag Images to upload to Imgur</p>
                                <div className="loading" style={{ marginTop: 15 }}>
                                    <span style={{ display: "inline-block", color: "#888", marginRight: 10 }}>Uploading to Imgur...</span>
                                    <img src="/img/ajax-loader.gif" style={{ margin: "5px 10px 0 0" }} />
                                </div>
                            </div>
                        </DropZone>
                    </div>
                </div>
            </div>
        </div>);
    }
} 