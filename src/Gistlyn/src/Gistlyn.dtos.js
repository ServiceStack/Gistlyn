/* Options:
Date: 2016-06-29 01:20:33
Version: 4.00
Tip: To override a DTO option, remove "//" prefix before updating
BaseUrl: http://localhost:54991

//GlobalNamespace:
ExportAsTypes: True
//MakePropertiesOptional: True
//AddServiceStackTypes: True
//AddResponseStatus: False
//AddImplicitVersion:
//AddDescriptionAsComments: True
//IncludeTypes:
//ExcludeTypes:
//DefaultImports:
*/
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ResponseStatus, ScriptExecutionResult, VariableInfo, AssemblyReference, EmbedScriptExecutionResult, NugetPackageInfo, ResponseError, ErrorInfo, HelloResponse, TestServerEventsResponse, ScriptVariableJson, EvaluateExpressionResponse, ScriptStateVariables, ScriptStatusResponse, EvaluateSourceResponse, CancelScriptResponse, CancelEmbedScriptResponse, RunScriptResponse, RunEmbedScriptResponse, SearchNugetPackagesResponse, InstallNugetPackageResponse, AddPackageAsReferenceResponse, SearchInstalledPackagesResponse, Hello, TestServerEvents, GetScriptVariableJson, EvaluateExpression, GetScriptVariables, GetScriptStatus, EvaluateSource, CancelScript, CancelEmbedScript, RunScript, RunEmbedScript, SearchNugetPackages, InstallNugetPackage, AddPackageAsReference, SearchInstalledPackages, GetEmbedScript;
    return {
        setters:[],
        execute: function() {
            // @DataContract
            ResponseStatus = (function () {
                function ResponseStatus() {
                }
                return ResponseStatus;
            }());
            exports_1("ResponseStatus", ResponseStatus);
            ScriptExecutionResult = (function () {
                function ScriptExecutionResult() {
                }
                return ScriptExecutionResult;
            }());
            exports_1("ScriptExecutionResult", ScriptExecutionResult);
            VariableInfo = (function () {
                function VariableInfo() {
                }
                return VariableInfo;
            }());
            exports_1("VariableInfo", VariableInfo);
            AssemblyReference = (function () {
                function AssemblyReference() {
                }
                return AssemblyReference;
            }());
            exports_1("AssemblyReference", AssemblyReference);
            EmbedScriptExecutionResult = (function () {
                function EmbedScriptExecutionResult() {
                }
                return EmbedScriptExecutionResult;
            }());
            exports_1("EmbedScriptExecutionResult", EmbedScriptExecutionResult);
            NugetPackageInfo = (function () {
                function NugetPackageInfo() {
                }
                return NugetPackageInfo;
            }());
            exports_1("NugetPackageInfo", NugetPackageInfo);
            // @DataContract
            ResponseError = (function () {
                function ResponseError() {
                }
                return ResponseError;
            }());
            exports_1("ResponseError", ResponseError);
            ErrorInfo = (function () {
                function ErrorInfo() {
                }
                return ErrorInfo;
            }());
            exports_1("ErrorInfo", ErrorInfo);
            HelloResponse = (function () {
                function HelloResponse() {
                }
                return HelloResponse;
            }());
            exports_1("HelloResponse", HelloResponse);
            TestServerEventsResponse = (function () {
                function TestServerEventsResponse() {
                }
                return TestServerEventsResponse;
            }());
            exports_1("TestServerEventsResponse", TestServerEventsResponse);
            ScriptVariableJson = (function () {
                function ScriptVariableJson() {
                }
                return ScriptVariableJson;
            }());
            exports_1("ScriptVariableJson", ScriptVariableJson);
            EvaluateExpressionResponse = (function () {
                function EvaluateExpressionResponse() {
                }
                return EvaluateExpressionResponse;
            }());
            exports_1("EvaluateExpressionResponse", EvaluateExpressionResponse);
            ScriptStateVariables = (function () {
                function ScriptStateVariables() {
                }
                return ScriptStateVariables;
            }());
            exports_1("ScriptStateVariables", ScriptStateVariables);
            ScriptStatusResponse = (function () {
                function ScriptStatusResponse() {
                }
                return ScriptStatusResponse;
            }());
            exports_1("ScriptStatusResponse", ScriptStatusResponse);
            EvaluateSourceResponse = (function () {
                function EvaluateSourceResponse() {
                }
                return EvaluateSourceResponse;
            }());
            exports_1("EvaluateSourceResponse", EvaluateSourceResponse);
            CancelScriptResponse = (function () {
                function CancelScriptResponse() {
                }
                return CancelScriptResponse;
            }());
            exports_1("CancelScriptResponse", CancelScriptResponse);
            CancelEmbedScriptResponse = (function () {
                function CancelEmbedScriptResponse() {
                }
                return CancelEmbedScriptResponse;
            }());
            exports_1("CancelEmbedScriptResponse", CancelEmbedScriptResponse);
            RunScriptResponse = (function () {
                function RunScriptResponse() {
                }
                return RunScriptResponse;
            }());
            exports_1("RunScriptResponse", RunScriptResponse);
            RunEmbedScriptResponse = (function () {
                function RunEmbedScriptResponse() {
                }
                return RunEmbedScriptResponse;
            }());
            exports_1("RunEmbedScriptResponse", RunEmbedScriptResponse);
            SearchNugetPackagesResponse = (function () {
                function SearchNugetPackagesResponse() {
                }
                return SearchNugetPackagesResponse;
            }());
            exports_1("SearchNugetPackagesResponse", SearchNugetPackagesResponse);
            InstallNugetPackageResponse = (function () {
                function InstallNugetPackageResponse() {
                }
                return InstallNugetPackageResponse;
            }());
            exports_1("InstallNugetPackageResponse", InstallNugetPackageResponse);
            AddPackageAsReferenceResponse = (function () {
                function AddPackageAsReferenceResponse() {
                }
                return AddPackageAsReferenceResponse;
            }());
            exports_1("AddPackageAsReferenceResponse", AddPackageAsReferenceResponse);
            SearchInstalledPackagesResponse = (function () {
                function SearchInstalledPackagesResponse() {
                }
                return SearchInstalledPackagesResponse;
            }());
            exports_1("SearchInstalledPackagesResponse", SearchInstalledPackagesResponse);
            Hello = (function () {
                function Hello() {
                }
                Hello.prototype.createResponse = function () { return new HelloResponse(); };
                return Hello;
            }());
            exports_1("Hello", Hello);
            // @Route("/test")
            // @Route("/test/{Name}")
            TestServerEvents = (function () {
                function TestServerEvents() {
                }
                TestServerEvents.prototype.createResponse = function () { return new TestServerEventsResponse(); };
                return TestServerEvents;
            }());
            exports_1("TestServerEvents", TestServerEvents);
            // @Route("/scripts/{ScriptId}/vars/{VariableName}/json")
            GetScriptVariableJson = (function () {
                function GetScriptVariableJson() {
                }
                GetScriptVariableJson.prototype.createResponse = function () { return new ScriptVariableJson(); };
                return GetScriptVariableJson;
            }());
            exports_1("GetScriptVariableJson", GetScriptVariableJson);
            // @Route("/scripts/{ScriptId}/evaluate")
            EvaluateExpression = (function () {
                function EvaluateExpression() {
                }
                EvaluateExpression.prototype.createResponse = function () { return new EvaluateExpressionResponse(); };
                return EvaluateExpression;
            }());
            exports_1("EvaluateExpression", EvaluateExpression);
            // @Route("/scripts/{ScriptId}/vars")
            // @Route("/scripts/{ScriptId}/vars/{VariableName}")
            GetScriptVariables = (function () {
                function GetScriptVariables() {
                }
                GetScriptVariables.prototype.createResponse = function () { return new ScriptStateVariables(); };
                return GetScriptVariables;
            }());
            exports_1("GetScriptVariables", GetScriptVariables);
            // @Route("/scripts/{ScriptId}/status")
            GetScriptStatus = (function () {
                function GetScriptStatus() {
                }
                GetScriptStatus.prototype.createResponse = function () { return new ScriptStatusResponse(); };
                return GetScriptStatus;
            }());
            exports_1("GetScriptStatus", GetScriptStatus);
            // @Route("/evaluate")
            EvaluateSource = (function () {
                function EvaluateSource() {
                }
                EvaluateSource.prototype.createResponse = function () { return new EvaluateSourceResponse(); };
                return EvaluateSource;
            }());
            exports_1("EvaluateSource", EvaluateSource);
            // @Route("/scripts/{ScriptId}/cancel")
            CancelScript = (function () {
                function CancelScript() {
                }
                CancelScript.prototype.createResponse = function () { return new CancelScriptResponse(); };
                return CancelScript;
            }());
            exports_1("CancelScript", CancelScript);
            // @Route("/embed-scripts/{ScriptId}/cancel")
            CancelEmbedScript = (function () {
                function CancelEmbedScript() {
                }
                CancelEmbedScript.prototype.createResponse = function () { return new CancelEmbedScriptResponse(); };
                return CancelEmbedScript;
            }());
            exports_1("CancelEmbedScript", CancelEmbedScript);
            // @Route("/scripts/{ScriptId}/run")
            RunScript = (function () {
                function RunScript() {
                }
                RunScript.prototype.createResponse = function () { return new RunScriptResponse(); };
                return RunScript;
            }());
            exports_1("RunScript", RunScript);
            // @Route("/embed-scripts/{ScriptId}/gists/{GistHash}/run")
            RunEmbedScript = (function () {
                function RunEmbedScript() {
                }
                RunEmbedScript.prototype.createResponse = function () { return new RunEmbedScriptResponse(); };
                return RunEmbedScript;
            }());
            exports_1("RunEmbedScript", RunEmbedScript);
            // @Route("/nuget/packages/search/{Search}")
            SearchNugetPackages = (function () {
                function SearchNugetPackages() {
                }
                SearchNugetPackages.prototype.createResponse = function () { return new SearchNugetPackagesResponse(); };
                return SearchNugetPackages;
            }());
            exports_1("SearchNugetPackages", SearchNugetPackages);
            // @Route("/packages/install")
            InstallNugetPackage = (function () {
                function InstallNugetPackage() {
                }
                InstallNugetPackage.prototype.createResponse = function () { return new InstallNugetPackageResponse(); };
                return InstallNugetPackage;
            }());
            exports_1("InstallNugetPackage", InstallNugetPackage);
            // @Route("/packages/references")
            AddPackageAsReference = (function () {
                function AddPackageAsReference() {
                }
                AddPackageAsReference.prototype.createResponse = function () { return new AddPackageAsReferenceResponse(); };
                return AddPackageAsReference;
            }());
            exports_1("AddPackageAsReference", AddPackageAsReference);
            // @Route("/packages/search/{Search}")
            SearchInstalledPackages = (function () {
                function SearchInstalledPackages() {
                }
                SearchInstalledPackages.prototype.createResponse = function () { return new SearchInstalledPackagesResponse(); };
                return SearchInstalledPackages;
            }());
            exports_1("SearchInstalledPackages", SearchInstalledPackages);
            // @Route("/gists/{Gist}/embed")
            GetEmbedScript = (function () {
                function GetEmbedScript() {
                }
                return GetEmbedScript;
            }());
            exports_1("GetEmbedScript", GetEmbedScript);
        }
    }
});
//# sourceMappingURL=Gistlyn.dtos.js.map