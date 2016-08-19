System.register(['react-redux', 'servicestack-client', './Gistlyn.dtos'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var react_redux_1, servicestack_client_1, Gistlyn_dtos_1;
    var Config, StateKey, GistCacheKey, client, GistTemplates, FileNames, ua, platform, UA, BatchItems;
    function reduxify(mapStateToProps, mapDispatchToProps, mergeProps, options) {
        return function (target) { return (react_redux_1.connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target)); };
    }
    exports_1("reduxify", reduxify);
    function toGithubFiles(files) {
        var fileContents = {};
        Object.keys(files).forEach(function (fileName) {
            var file = new Gistlyn_dtos_1.GithubFile();
            file.filename = fileName;
            file.content = files[fileName].content;
            fileContents[fileName] = file;
        });
        return fileContents;
    }
    exports_1("toGithubFiles", toGithubFiles);
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
    function addPackages(packagesConfig, pkgs) {
        var xml = "";
        pkgs.forEach(function (pkg) {
            if (!pkg.id || packagesConfig.indexOf("\"" + pkg.id + "\"") >= 0)
                return;
            var attrs = Object.keys(pkg).map(function (k) { return (k + "=\"" + pkg[k] + "\""); });
            xml += "  <package " + attrs.join(" ") + " />\n";
        });
        return xml
            ? packagesConfig.replace("</packages>", "") + xml + "</packages>"
            : packagesConfig;
    }
    exports_1("addPackages", addPackages);
    function addClientPackages(packagesConfig) {
        return addPackages(packagesConfig, [
            { id: "ServiceStack.Client", version: Config.LatestVersion, targetFramework: "net45" },
            { id: "ServiceStack.Text", version: Config.LatestVersion, targetFramework: "net45" },
            { id: "ServiceStack.Interfaces", version: Config.LatestVersion, targetFramework: "net45" },
        ]);
    }
    exports_1("addClientPackages", addClientPackages);
    return {
        setters:[
            function (react_redux_1_1) {
                react_redux_1 = react_redux_1_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            },
            function (Gistlyn_dtos_1_1) {
                Gistlyn_dtos_1 = Gistlyn_dtos_1_1;
            }],
        execute: function() {
            exports_1("Config", Config = {
                LatestVersion: "4.0.60",
            });
            exports_1("StateKey", StateKey = "/v1/state");
            exports_1("GistCacheKey", GistCacheKey = function (gist) { return ("/v1/gists/" + gist); });
            exports_1("client", client = new servicestack_client_1.JsonServiceClient("/"));
            exports_1("GistTemplates", GistTemplates = {
                NewGist: "52c37e37b51a0ec92810477be34695ae",
                NewPrivateGist: "492e199fa3ec5394ef0bc1aedd3240c7",
                NewCollection: "854ec4df3502ecdfe9ca24d4745e484f",
                AddServiceStackReferenceGist: "2dbd4ccff70851ce8ae55678f4f15d0a",
                AddServiceStackReferenceCollection: "363605c3c121784ebababac4a03e8910",
                CollectionsCollection: "457a7035675513ba1365195658a5d792",
                SnapshotsCollection: "1576fda8eea87abbe94fa8051b4fed34",
                HomeCollection: "2cc6b5db6afd3ccb0d0149e55fdb3a6a",
                DownloadCollection: "74d7b0467a197f678bb4220b2c301ac3",
                RedisTodo: "54e452bb1e86e132068a595d7e72d1a6",
                OrmLiteTodo: "0cd558e817f28f77b974c44c3e12ff6f",
                PocoDynamoTodo: "d36339c55be6a43942a60c1eaf687bfd",
                Gists: ["52c37e37b51a0ec92810477be34695ae", "492e199fa3ec5394ef0bc1aedd3240c7", "854ec4df3502ecdfe9ca24d4745e484f",
                    "2dbd4ccff70851ce8ae55678f4f15d0a", "363605c3c121784ebababac4a03e8910",
                    "457a7035675513ba1365195658a5d792", "1576fda8eea87abbe94fa8051b4fed34",
                    "2cc6b5db6afd3ccb0d0149e55fdb3a6a", "74d7b0467a197f678bb4220b2c301ac3",
                    "54e452bb1e86e132068a595d7e72d1a6", "0cd558e817f28f77b974c44c3e12ff6f", "d36339c55be6a43942a60c1eaf687bfd"]
            });
            exports_1("FileNames", FileNames = {
                GistMain: "main.cs",
                GistPackages: "packages.config",
                CollectionIndex: "index.md",
                Snapshot: "snapshot.json"
            });
            ua = navigator.userAgent;
            platform = navigator.platform.toLowerCase();
            exports_1("UA", UA = (_a = {
                    ipad: ua.match(/iPad/i) != null,
                    nosse: !("EventSource" in window)
                },
                _a[platform] = true,
                _a.mac = platform.indexOf("mac") >= 0,
                _a.safari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
                _a.getClassList = function () {
                    var _this = this;
                    var cls = Object.keys(this).filter(function (k) { return _this[k] === true; });
                    return cls.join(" ");
                },
                _a
            ));
            ;
            BatchItems = (function () {
                function BatchItems(everyMs, callback) {
                    this.everyMs = everyMs;
                    this.callback = callback;
                    this.results = [];
                }
                BatchItems.prototype.queue = function (result) {
                    var _this = this;
                    if (this.timeoutId == null) {
                        this.results.push(result);
                        this.callback(this.results); //return 1st result for instant feedback
                        this.results = [];
                        this.timeoutId = setTimeout(function () {
                            var results = _this.results;
                            _this.results = [];
                            _this.timeoutId = null;
                            if (results.length > 0) {
                                _this.callback(results);
                            }
                        }, this.everyMs);
                    }
                    else {
                        this.results.push(result); //buffer results if timer is active
                    }
                };
                return BatchItems;
            }());
            exports_1("BatchItems", BatchItems);
        }
    }
    var _a;
});
//# sourceMappingURL=utils.js.map