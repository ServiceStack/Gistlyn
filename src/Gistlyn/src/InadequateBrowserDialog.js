System.register(['react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var InadequateBrowserDialog;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            InadequateBrowserDialog = (function (_super) {
                __extends(InadequateBrowserDialog, _super);
                function InadequateBrowserDialog() {
                    _super.apply(this, arguments);
                }
                InadequateBrowserDialog.prototype.render = function () {
                    return (React.createElement("div", {id: "nosse", style: {
                        background: "url(https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/no-ie.jpg) no-repeat",
                        backgroundSize: "cover",
                        height: "100%",
                        width: "100%"
                    }}, React.createElement("div", {id: "nosse-dialog", style: { position: "absolute", top: 20, right: 20, color: "#f7f7f7", fontSize: 24, lineHeight: "30px", maxWidth: 800 }}, React.createElement("p", null, "If you're seeing this message your browser still doesn't have native support for", React.createElement("a", {href: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"}, "Server Sent Events (SSE)"), "- a simple", React.createElement("a", {href: "https://html.spec.whatwg.org/multipage/comms.html#server-sent-events"}, "Web Standard"), "supported by most modern browsers since 2011. If you would like this site to" + ' ' + "work in Internet Explorer or MS Edge browsers", React.createElement("a", {href: "https://wpdev.uservoice.com/forums/257854-microsoft-edge-developer/suggestions/6263825-server-sent-events-eventsource"}, "vote to have them implement it.")), React.createElement("br", null), React.createElement("p", null, "In the meantime we recommend using these better browsers below:"), React.createElement("ul", {style: { listStyleType: "disc", margin: 30 }}, React.createElement("li", null, React.createElement("a", {href: "https://www.google.com/chrome/browser/desktop/"}, "Chrome")), React.createElement("li", null, React.createElement("a", {href: "http://www.apple.com/safari/"}, "Safari")), React.createElement("li", null, React.createElement("a", {href: "https://www.mozilla.org/en-US/firefox/"}, "Firefox")), React.createElement("li", null, React.createElement("a", {href: "http://www.opera.com/"}, "Opera"))))));
                };
                return InadequateBrowserDialog;
            }(React.Component));
            exports_1("default", InadequateBrowserDialog);
        }
    }
});
//# sourceMappingURL=InadequateBrowserDialog.js.map