System.register(['react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var JsonViewer, show, keyFmt, uniqueKeys, valueFmt, num, date, pad, dmft, str, obj, arr, val;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            JsonViewer = (function (_super) {
                __extends(JsonViewer, _super);
                function JsonViewer() {
                    _super.apply(this, arguments);
                }
                JsonViewer.prototype.render = function () {
                    var value = this.props.value || (this.props.json && JSON.parse(this.props.json));
                    return (React.createElement("div", {className: "jsonviewer"}, val(value)));
                };
                return JsonViewer;
            }(React.Component));
            exports_1("JsonViewer", JsonViewer);
            show = function (k) { return typeof k !== "string" || k.substr(0, 2) !== "__"; };
            keyFmt = function (t) { return t; };
            uniqueKeys = function (m) {
                var h = {};
                for (var i = 0, len = m.length; i < len; i++) {
                    for (var k in m[i]) {
                        if (show(k))
                            h[k] = k;
                    }
                }
                return h;
            };
            valueFmt = function (k, v, vFmt) { return vFmt; };
            num = function (m) { return m; };
            date = function (s) { return new Date(parseFloat(/Date\(([^)]+)\)/.exec(s)[1])); };
            pad = function (d) { return d < 10 ? '0' + d : d; };
            dmft = function (d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()); };
            str = function (m) { return m.substr(0, 6) === '/Date(' ? dmft(date(m)) : m; };
            obj = function (m) {
                return (React.createElement("dl", null, Object.keys(m).filter(show).map(function (k) { return ([React.createElement("dt", {className: "ib"}, keyFmt(k)), React.createElement("dd", null, valueFmt(k, m[k], val(m[k])))]); })));
            };
            arr = function (m) {
                if (typeof m[0] == 'string' || typeof m[0] == 'number')
                    return React.createElement("span", null, m.join(', '));
                var h = uniqueKeys(m);
                return (React.createElement("table", null, React.createElement("caption", null), React.createElement("thead", null, React.createElement("tr", null, Object.keys(h).map(function (k) { return (React.createElement("th", null, React.createElement("b", null), keyFmt(k))); }))), React.createElement("tbody", null, m.map(function (row) { return (React.createElement("tr", null, Object.keys(h).filter(show).map(function (k) { return React.createElement("td", null, valueFmt(k, row[k], val(row[k]))); }))); }))));
            };
            val = function (m, valueFn) {
                if (valueFn === void 0) { valueFn = null; }
                if (valueFn)
                    valueFmt = valueFn;
                if (m == null)
                    return "";
                if (typeof m == "number")
                    return num(m);
                if (typeof m == "string")
                    return str(m);
                if (typeof m == "boolean")
                    return m ? "true" : "false";
                return m.length ? arr(m) : obj(m);
            };
        }
    }
});
//# sourceMappingURL=json-viewer.js.map