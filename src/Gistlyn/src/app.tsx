// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/browser.d.ts'/>

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import HelloWorld from './hello';

import CodeMirror from 'react-codemirror';

import "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js";
import "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js";
import "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js";
import "./codemirror.js";

var options = {
    lineNumbers: true,
    matchBrackets: true,
    indentUnit: 4,
    mode: "text/x-csharp",
    extraKeys: {
        "F11" (cm) {
            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc" (cm) {
            if (cm.getOption("fullScreen"))
                cm.setOption("fullScreen", false);
        }
    }
};

var source = `using System;

//this is a comment
var a = 100;
if (a > 100)
{
    Console.WriteLine(a);
}
`;

class App extends React.Component<any,any> {
    render() {
        return (
            <div id="app">
                <div className="editor">
                    <CodeMirror value={source} options={options} />
                </div>
                <div className="preview">preview</div>
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("content"));