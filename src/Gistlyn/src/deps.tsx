// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path='../typings/index.d.ts'/>

import * as React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as ES6 from 'es6-shim';
import CodeMirror from 'react-codemirror';

class Deps extends React.Component<any, any> {
    render() {
        return <div>Hello, World!</div>;
    }
}

const ignore = () => render(<Deps/>, document.body);

const ignoreES6 = () => new ES6.Promise(() => (ES6.Object.assign({}, {})));

const ignoreRedix = () => {
    var store = createStore((state, action) => null);
    render(<Provider store={store}><CodeMirror /></Provider>, document.body);
}