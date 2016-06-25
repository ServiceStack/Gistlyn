"format cjs";
(function (mod) {
    if (typeof exports == "object" && typeof module == "object")
        mod(require('codemirror'));
    else if (typeof define == "function" && define.amd)
        define(["codemirror"], mod);
    else
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

});