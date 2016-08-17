import * as React from 'react';

export default class ImageUploadDialog extends React.Component<any, any> {
    dialog: HTMLDivElement;
    fileImage: HTMLInputElement;
    txtImageUrl: HTMLInputElement;

    handleImageUpload() {
        if (this.txtImageUrl && this.txtImageUrl.value.startsWith("http")) {
            this.props.onChange(this.txtImageUrl.value);
            return;
        }

        const file = this.fileImage.files[0];
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
        .then(r => {
            this.dialog.classList.remove("disabled");
            if (r.status == 200 || r.status == 0) {
                r.json().then(o => {
                    this.props.onChange(o.data.link);
                });
            } else {
                alert("Error uploading Image: ");
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
                    Add Image
                </div>
                <div className="dialog-body">
                    <div className="row">
                        <label htmlFor="txtImageUrl" style={hasSelectedImage ? disabledColor : null}>Image URL</label>
                        <input ref={e => this.txtImageUrl = e} type="text" id="txtImageUrl"
                            onKeyUp={e => this.forceUpdate() }
                            placeholder="Enter the Image URL you want to use" 
                            onKeyDown={e => e.keyCode == 13 && hasProvidedUrl ? e.preventDefault() || this.props.onChange((e.target as HTMLInputElement).value) : null }
                            disabled={hasSelectedImage} autoFocus />
                    </div>
                    <div className="row">
                        <label htmlFor="fileImage" style={hasProvidedUrl ? disabledColor : null}>Upload Image</label>
                        <input ref={e => this.fileImage = e} type="file" id="fileImage" 
                            onChange={e => this.handleImageUpload()}
                            style={{fontSize:16}} 
                            disabled={hasProvidedUrl} />
                    </div>
                </div>
                <div className="dialog-footer">
                    <img className="loading" src="/img/ajax-loader.gif" style={{ margin: "5px 10px 0 0" }} />
                    <span className={"btn" + (hasSelectedImage || hasProvidedUrl ? "" : " disabled") }
                        onClick={e => this.handleImageUpload() }>
                        {hasSelectedImage ? "Upload to Imgur" : "Insert Image"}
                    </span>
                </div>
            </div>
        </div>);
    }
} 