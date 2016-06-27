System.register(['react-dom', 'react', './servicestack-client', './Gistlyn.dtos'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var ReactDOM, React, servicestack_client_1;
    var dto, client, Hello, HelloResponse, ResponseStatus, ResponseError, Test;
    return {
        setters:[
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (React_1) {
                React = React_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            },
            function (_1) {}],
        execute: function() {
            client = new servicestack_client_1.JsonServiceClient("/");
            //client.get(new )
            Hello = (function () {
                function Hello() {
                }
                Hello.prototype.getResponseType = function () { return new HelloResponse(); };
                return Hello;
            }());
            HelloResponse = (function () {
                function HelloResponse() {
                }
                return HelloResponse;
            }());
            exports_1("HelloResponse", HelloResponse);
            ResponseStatus = (function () {
                function ResponseStatus() {
                }
                return ResponseStatus;
            }());
            exports_1("ResponseStatus", ResponseStatus);
            ResponseError = (function () {
                function ResponseError() {
                }
                return ResponseError;
            }());
            exports_1("ResponseError", ResponseError);
            Test = (function (_super) {
                __extends(Test, _super);
                function Test() {
                    _super.apply(this, arguments);
                }
                Test.prototype.componentWillMount = function () {
                    var _this = this;
                    this.state = { result: 'loading...' };
                    //this.loadGist("6831799881c92434f80e141c8a2699eb");
                    var request = new Hello();
                    request.name = "World";
                    client.get(request)
                        .then(function (r) {
                        console.log(r);
                        _this.setState({ result: r.result });
                    })
                        .catch(function (r) {
                        console.log('error', r);
                    });
                };
                Test.prototype.loadGist = function (gist) {
                    var _this = this;
                    fetch("https://api.github.com/gists/" + gist)
                        .then(function (r) {
                        r.json().then(function (result) {
                            console.log(result);
                            var sb = [];
                            for (var k in result.files) {
                                var file = result.files[k];
                                sb.push(file.filename);
                            }
                            _this.setState({ result: sb.join(', ') });
                        });
                    });
                };
                Test.prototype.render = function () {
                    return (React.createElement("div", null, this.state.result));
                };
                return Test;
            }(React.Component));
            ReactDOM.render(React.createElement(Test, null), document.getElementById("app"));
        }
    }
});
//# sourceMappingURL=TestClient.js.map