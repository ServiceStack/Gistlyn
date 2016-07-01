/// <reference path='../typings/index.d.ts'/>

import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { JsonServiceClient, IReturn, nameOf } from './servicestack-client';
import { Hello, HelloResponse } from './Gistlyn.dtos';

export class a implements IReturn<HelloResponse>
{
    name: string;
    createResponse() { return new HelloResponse(); }
    getTypeName() { return "Hello2"; }
}

console.log('Hello', nameOf(new Hello()));
console.log('Hello2', nameOf(new a()));

var client = new JsonServiceClient("/");

class Test extends React.Component<any, any> {

    componentWillMount(): void {
        this.state = { result: 'loading...' };
        //this.loadGist("6831799881c92434f80e141c8a2699eb");

        //const request = new Hello();
        //request.name = "World";

        //client.get(request)
        //    .then(r => {
        //        console.log(r);
        //        this.setState({ result: r.result });
        //    })
        //    .catch(r => {
        //        console.log('error', r);
        //    });
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
