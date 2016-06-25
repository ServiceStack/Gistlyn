/* Options:
Date: 2016-06-25 11:57:04
Version: 4.060
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
var Gistlyn;
(function (Gistlyn) {
    var ServiceModel;
    (function (ServiceModel) {
        var VariableInfo = (function () {
            function VariableInfo() {
            }
            return VariableInfo;
        }());
        ServiceModel.VariableInfo = VariableInfo;
        var ScriptExecutionResult = (function () {
            function ScriptExecutionResult() {
            }
            return ScriptExecutionResult;
        }());
        ServiceModel.ScriptExecutionResult = ScriptExecutionResult;
        var AssemblyReference = (function () {
            function AssemblyReference() {
            }
            return AssemblyReference;
        }());
        ServiceModel.AssemblyReference = AssemblyReference;
        var EmbedScriptExecutionResult = (function () {
            function EmbedScriptExecutionResult() {
            }
            return EmbedScriptExecutionResult;
        }());
        ServiceModel.EmbedScriptExecutionResult = EmbedScriptExecutionResult;
        var NugetPackageInfo = (function () {
            function NugetPackageInfo() {
            }
            return NugetPackageInfo;
        }());
        ServiceModel.NugetPackageInfo = NugetPackageInfo;
        var ErrorInfo = (function () {
            function ErrorInfo() {
            }
            return ErrorInfo;
        }());
        ServiceModel.ErrorInfo = ErrorInfo;
        // @DataContract
        var ResponseStatus = (function () {
            function ResponseStatus() {
            }
            return ResponseStatus;
        }());
        ServiceModel.ResponseStatus = ResponseStatus;
        // @DataContract
        var ResponseError = (function () {
            function ResponseError() {
            }
            return ResponseError;
        }());
        ServiceModel.ResponseError = ResponseError;
        var TestServerEventsResponse = (function () {
            function TestServerEventsResponse() {
            }
            return TestServerEventsResponse;
        }());
        ServiceModel.TestServerEventsResponse = TestServerEventsResponse;
        var ScriptVariableJson = (function () {
            function ScriptVariableJson() {
            }
            return ScriptVariableJson;
        }());
        ServiceModel.ScriptVariableJson = ScriptVariableJson;
        var ScriptStateVariables = (function () {
            function ScriptStateVariables() {
            }
            return ScriptStateVariables;
        }());
        ServiceModel.ScriptStateVariables = ScriptStateVariables;
        var ScriptStatusResponse = (function () {
            function ScriptStatusResponse() {
            }
            return ScriptStatusResponse;
        }());
        ServiceModel.ScriptStatusResponse = ScriptStatusResponse;
        var EvaluateSourceResponse = (function () {
            function EvaluateSourceResponse() {
            }
            return EvaluateSourceResponse;
        }());
        ServiceModel.EvaluateSourceResponse = EvaluateSourceResponse;
        var CancelScriptResponse = (function () {
            function CancelScriptResponse() {
            }
            return CancelScriptResponse;
        }());
        ServiceModel.CancelScriptResponse = CancelScriptResponse;
        var CancelEmbedScriptResponse = (function () {
            function CancelEmbedScriptResponse() {
            }
            return CancelEmbedScriptResponse;
        }());
        ServiceModel.CancelEmbedScriptResponse = CancelEmbedScriptResponse;
        var RunScriptResponse = (function () {
            function RunScriptResponse() {
            }
            return RunScriptResponse;
        }());
        ServiceModel.RunScriptResponse = RunScriptResponse;
        var RunEmbedScriptResponse = (function () {
            function RunEmbedScriptResponse() {
            }
            return RunEmbedScriptResponse;
        }());
        ServiceModel.RunEmbedScriptResponse = RunEmbedScriptResponse;
        var SearchNugetPackagesResponse = (function () {
            function SearchNugetPackagesResponse() {
            }
            return SearchNugetPackagesResponse;
        }());
        ServiceModel.SearchNugetPackagesResponse = SearchNugetPackagesResponse;
        var InstallNugetPackageResponse = (function () {
            function InstallNugetPackageResponse() {
            }
            return InstallNugetPackageResponse;
        }());
        ServiceModel.InstallNugetPackageResponse = InstallNugetPackageResponse;
        var AddPackageAsReferenceResponse = (function () {
            function AddPackageAsReferenceResponse() {
            }
            return AddPackageAsReferenceResponse;
        }());
        ServiceModel.AddPackageAsReferenceResponse = AddPackageAsReferenceResponse;
        var SearchInstalledPackagesResponse = (function () {
            function SearchInstalledPackagesResponse() {
            }
            return SearchInstalledPackagesResponse;
        }());
        ServiceModel.SearchInstalledPackagesResponse = SearchInstalledPackagesResponse;
        // @Route("/test")
        // @Route("/test/{Name}")
        var TestServerEvents = (function () {
            function TestServerEvents() {
            }
            return TestServerEvents;
        }());
        ServiceModel.TestServerEvents = TestServerEvents;
        // @Route("/scripts/{ScriptId}/vars/{VariableName}/json")
        var GetScriptVariableJson = (function () {
            function GetScriptVariableJson() {
            }
            return GetScriptVariableJson;
        }());
        ServiceModel.GetScriptVariableJson = GetScriptVariableJson;
        // @Route("/scripts/evaluate")
        var EvaluateExpression = (function () {
            function EvaluateExpression() {
            }
            return EvaluateExpression;
        }());
        ServiceModel.EvaluateExpression = EvaluateExpression;
        // @Route("/scripts/{ScriptId}/vars/{VariableName}")
        var GetScriptVariables = (function () {
            function GetScriptVariables() {
            }
            return GetScriptVariables;
        }());
        ServiceModel.GetScriptVariables = GetScriptVariables;
        // @Route("/scripts/{ScriptId}/status")
        var GetScriptStatus = (function () {
            function GetScriptStatus() {
            }
            return GetScriptStatus;
        }());
        ServiceModel.GetScriptStatus = GetScriptStatus;
        // @Route("/evaluate")
        var EvaluateSource = (function () {
            function EvaluateSource() {
            }
            return EvaluateSource;
        }());
        ServiceModel.EvaluateSource = EvaluateSource;
        // @Route("/scripts/{ScriptId}/cancel")
        var CancelScript = (function () {
            function CancelScript() {
            }
            return CancelScript;
        }());
        ServiceModel.CancelScript = CancelScript;
        // @Route("/embed-scripts/{ScriptId}/cancel")
        var CancelEmbedScript = (function () {
            function CancelEmbedScript() {
            }
            return CancelEmbedScript;
        }());
        ServiceModel.CancelEmbedScript = CancelEmbedScript;
        // @Route("/scripts/{ScriptId}/run")
        var RunScript = (function () {
            function RunScript() {
            }
            return RunScript;
        }());
        ServiceModel.RunScript = RunScript;
        // @Route("/embed-scripts/{ScriptId}/gists/{GistHash}/run")
        var RunEmbedScript = (function () {
            function RunEmbedScript() {
            }
            return RunEmbedScript;
        }());
        ServiceModel.RunEmbedScript = RunEmbedScript;
        // @Route("/nuget/packages/search/{Search}")
        var SearchNugetPackages = (function () {
            function SearchNugetPackages() {
            }
            return SearchNugetPackages;
        }());
        ServiceModel.SearchNugetPackages = SearchNugetPackages;
        // @Route("/packages/install")
        var InstallNugetPackage = (function () {
            function InstallNugetPackage() {
            }
            return InstallNugetPackage;
        }());
        ServiceModel.InstallNugetPackage = InstallNugetPackage;
        // @Route("/packages/references")
        var AddPackageAsReference = (function () {
            function AddPackageAsReference() {
            }
            return AddPackageAsReference;
        }());
        ServiceModel.AddPackageAsReference = AddPackageAsReference;
        // @Route("/packages/search/{Search}")
        var SearchInstalledPackages = (function () {
            function SearchInstalledPackages() {
            }
            return SearchInstalledPackages;
        }());
        ServiceModel.SearchInstalledPackages = SearchInstalledPackages;
        // @Route("/gists/{Gist}/embed")
        var GetEmbedScript = (function () {
            function GetEmbedScript() {
            }
            return GetEmbedScript;
        }());
        ServiceModel.GetEmbedScript = GetEmbedScript;
    })(ServiceModel = Gistlyn.ServiceModel || (Gistlyn.ServiceModel = {}));
})(Gistlyn || (Gistlyn = {}));
//# sourceMappingURL=Gistlyn.dtos.js.map