import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { JsonServiceClient } from './JsonServiceClient';
import './Gistlyn.dtos';
import dtos = Gistlyn.ServiceModel;

var client = new JsonServiceClient("/");

//client.get(new )

class Test extends React.Component<any, any> {

    componentWillMount(): void {
        this.state = { result: 'loading...' };
        const gist = "6831799881c92434f80e141c8a2699eb";

        fetch("https://api.github.com/gists/" + gist)
            .then((r) => {
                r.json().then((result) => {
                    console.log(result);

                    var sb = [];
                    for (var k in result.files) {
                        var file = result.files[k];
                        sb.push(file.filename);
                    }

                    this.setState({ result: sb.join(', ') });
                });
            });
    }

    render() {
        return (<div>{this.state.result}</div>);
    }
}

ReactDOM.render(
    <Test />,
    document.getElementById("app"));
