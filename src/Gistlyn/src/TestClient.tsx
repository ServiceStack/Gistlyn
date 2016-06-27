import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { JsonServiceClient, IReturn } from './servicestack-client';
import './Gistlyn.dtos';
import dto = Gistlyn.ServiceModel;

var client = new JsonServiceClient("/");

//client.get(new )

class Hello implements IReturn<HelloResponse>
{
    name: string;

    getResponseType(): HelloResponse { return new HelloResponse(); }
}
export class HelloResponse {
    result: string;
    responseStatus: ResponseStatus;
}
export class ResponseStatus {
    errorCode: string;
    message: string;
    stackTrace: string;
    errors: ResponseError[];
    meta: { [index: string]: string; };
}
export class ResponseError {
    errorCode: string;
    fieldName: string;
    message: string;
    meta: { [index: string]: string; };
}

class Test extends React.Component<any, any> {

    componentWillMount(): void {
        this.state = { result: 'loading...' };
        //this.loadGist("6831799881c92434f80e141c8a2699eb");

        const request = new Hello();
        request.name = "World";
        
        client.get(request)
            .then(r => {
                console.log(r);
                this.setState({ result: r.result });
            })
            .catch(r => {
                console.log('error', r);
            });
    }

    loadGist(gist) {
        fetch("https://api.github.com/gists/" + gist)
            .then((r) => {
                r.json().then((result) => {
                    console.log(result);

                    var sb = [];
                    for (let k in result.files) {
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
