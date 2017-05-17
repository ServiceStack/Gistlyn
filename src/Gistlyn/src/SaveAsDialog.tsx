import * as React from 'react';

export default class SaveAsDialog extends React.Component<any, any> {
    txtDescription: HTMLInputElement;

    render() {
        var description = this.props.description;
        if (this.txtDescription) {
            description = this.txtDescription.value;
        } else {
            setTimeout(() => this.txtDescription.select(), 0);
        }

        return (<div id="dialog" onClick={e => this.props.onHide() } onKeyDown={e => e.keyCode === 27 ? this.props.onHide() : null }>
            <div className="dialog" ref={e => this.props.dialogRef(e) } onClick={e => e.stopPropagation() }>
                <div className="dialog-header">
                    <i className="material-icons close" onClick={e => this.props.onHide() }>close</i>
                    {this.props.shouldFork ? "Fork" : "Save"} Gist
                </div>
                <div className="dialog-body">
                    <div className="row">
                        <label htmlFor="txtDescription">Description</label>
                        <input ref={e => this.txtDescription = e} type="text" id="txtDescription"
                            defaultValue={ description }
                            onKeyUp={e => this.forceUpdate() }
                            onKeyDown={e => e.keyCode == 13 && description ? this.props.onSave({ description }) : null }
                            autoFocus />
                    </div>
                    <div className="row" style={{ color: this.props.isPublic ? "#4CAF50" : "#9C27B0" }} title={ "This gist is " + (this.props.isPublic ? "public" : "private") }>
                        <label></label>
                        <i className="material-icons" style={{ verticalAlign: "bottom", marginRight: 5, fontSize: 20 }}>check</i>
                        Is {this.props.isPublic ? "public" : "private"}
                    </div>
                </div>
                <div className="dialog-footer">
                    <img className="loading" src={require('./assets/img/ajax-loader.gif')} style={{ margin: "5px 10px 0 0" }} />
                    <span className={"btn" + (description ? "" : " disabled") }
                        onClick={e => description ? this.props.onSave({ description }) : null }>
                        Create {this.props.shouldFork ? "Fork" : "Gist"}
                    </span>
                </div>
            </div>
        </div>);
    }
} 