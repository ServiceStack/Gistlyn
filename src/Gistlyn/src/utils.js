System.register(['react-redux'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var react_redux_1;
    function reduxify(mapStateToProps, mapDispatchToProps, mergeProps, options) {
        return function (target) { return (react_redux_1.connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target)); };
    }
    exports_1("reduxify", reduxify);
    function getSortedFileNames(files) {
        var fileNames = Object.keys(files);
        fileNames.sort(function (a, b) {
            if (a.toLowerCase() === "main.cs")
                return -1;
            if (b.toLowerCase() === "main.cs")
                return 1;
            if (!a.endsWith(".cs") && b.endsWith(".cs"))
                return 1;
            if (a === b)
                return 0;
            return a < b ? -1 : 0;
        });
        return fileNames;
    }
    exports_1("getSortedFileNames", getSortedFileNames);
    return {
        setters:[
            function (react_redux_1_1) {
                react_redux_1 = react_redux_1_1;
            }],
        execute: function() {
            ;
        }
    }
});
//# sourceMappingURL=utils.js.map