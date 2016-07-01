/* Options:
Date: 2016-06-30 18:50:53
Version: 4.061
Tip: To override a DTO option, remove "//" prefix before updating
BaseUrl: http://localhost:5500

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
    var AssemblyReference, ScriptExecutionResult, ResponseStatus, VariableInfo, NugetPackageInfo, ErrorInfo, ResponseError, RunScriptResponse, ScriptStateVariables, EvaluateExpressionResponse, CancelScriptResponse, HelloResponse, TestServerEventsResponse, ScriptStatusResponse, EvaluateSourceResponse, SearchNugetPackagesResponse, InstallNugetPackageResponse, AddPackageAsReferenceResponse, SearchInstalledPackagesResponse, AuthenticateResponse, AssignRolesResponse, UnAssignRolesResponse, RunScript, GetScriptVariables, EvaluateExpression, CancelScript, Hello, TestServerEvents, GetScriptStatus, EvaluateSource, SearchNugetPackages, InstallNugetPackage, AddPackageAsReference, SearchInstalledPackages, Authenticate, AssignRoles, UnAssignRoles;
    return {
        setters:[],
        execute: function() {
            AssemblyReference = (function () {
                function AssemblyReference() {
                }
                return AssemblyReference;
            }());
            exports_1("AssemblyReference", AssemblyReference);
            ScriptExecutionResult = (function () {
                function ScriptExecutionResult() {
                }
                return ScriptExecutionResult;
            }());
            exports_1("ScriptExecutionResult", ScriptExecutionResult);
            // @DataContract
            ResponseStatus = (function () {
                function ResponseStatus() {
                }
                return ResponseStatus;
            }());
            exports_1("ResponseStatus", ResponseStatus);
            VariableInfo = (function () {
                function VariableInfo() {
                }
                return VariableInfo;
            }());
            exports_1("VariableInfo", VariableInfo);
            NugetPackageInfo = (function () {
                function NugetPackageInfo() {
                }
                return NugetPackageInfo;
            }());
            exports_1("NugetPackageInfo", NugetPackageInfo);
            ErrorInfo = (function () {
                function ErrorInfo() {
                }
                return ErrorInfo;
            }());
            exports_1("ErrorInfo", ErrorInfo);
            // @DataContract
            ResponseError = (function () {
                function ResponseError() {
                }
                return ResponseError;
            }());
            exports_1("ResponseError", ResponseError);
            RunScriptResponse = (function () {
                function RunScriptResponse() {
                }
                return RunScriptResponse;
            }());
            exports_1("RunScriptResponse", RunScriptResponse);
            ScriptStateVariables = (function () {
                function ScriptStateVariables() {
                }
                return ScriptStateVariables;
            }());
            exports_1("ScriptStateVariables", ScriptStateVariables);
            EvaluateExpressionResponse = (function () {
                function EvaluateExpressionResponse() {
                }
                return EvaluateExpressionResponse;
            }());
            exports_1("EvaluateExpressionResponse", EvaluateExpressionResponse);
            CancelScriptResponse = (function () {
                function CancelScriptResponse() {
                }
                return CancelScriptResponse;
            }());
            exports_1("CancelScriptResponse", CancelScriptResponse);
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
            // @DataContract
            AuthenticateResponse = (function () {
                function AuthenticateResponse() {
                }
                return AuthenticateResponse;
            }());
            exports_1("AuthenticateResponse", AuthenticateResponse);
            // @DataContract
            AssignRolesResponse = (function () {
                function AssignRolesResponse() {
                }
                return AssignRolesResponse;
            }());
            exports_1("AssignRolesResponse", AssignRolesResponse);
            // @DataContract
            UnAssignRolesResponse = (function () {
                function UnAssignRolesResponse() {
                }
                return UnAssignRolesResponse;
            }());
            exports_1("UnAssignRolesResponse", UnAssignRolesResponse);
            // @Route("/scripts/{ScriptId}/run")
            RunScript = (function () {
                function RunScript() {
                }
                RunScript.prototype.createResponse = function () { return new RunScriptResponse(); };
                RunScript.prototype.getTypeName = function () { return "RunScript"; };
                return RunScript;
            }());
            exports_1("RunScript", RunScript);
            // @Route("/scripts/{ScriptId}/vars")
            // @Route("/scripts/{ScriptId}/vars/{VariableName}")
            GetScriptVariables = (function () {
                function GetScriptVariables() {
                }
                GetScriptVariables.prototype.createResponse = function () { return new ScriptStateVariables(); };
                GetScriptVariables.prototype.getTypeName = function () { return "GetScriptVariables"; };
                return GetScriptVariables;
            }());
            exports_1("GetScriptVariables", GetScriptVariables);
            // @Route("/scripts/{ScriptId}/evaluate")
            EvaluateExpression = (function () {
                function EvaluateExpression() {
                }
                EvaluateExpression.prototype.createResponse = function () { return new EvaluateExpressionResponse(); };
                EvaluateExpression.prototype.getTypeName = function () { return "EvaluateExpression"; };
                return EvaluateExpression;
            }());
            exports_1("EvaluateExpression", EvaluateExpression);
            // @Route("/scripts/{ScriptId}/cancel")
            CancelScript = (function () {
                function CancelScript() {
                }
                CancelScript.prototype.createResponse = function () { return new CancelScriptResponse(); };
                CancelScript.prototype.getTypeName = function () { return "CancelScript"; };
                return CancelScript;
            }());
            exports_1("CancelScript", CancelScript);
            Hello = (function () {
                function Hello() {
                }
                Hello.prototype.createResponse = function () { return new HelloResponse(); };
                Hello.prototype.getTypeName = function () { return "Hello"; };
                return Hello;
            }());
            exports_1("Hello", Hello);
            // @Route("/test")
            // @Route("/test/{Name}")
            TestServerEvents = (function () {
                function TestServerEvents() {
                }
                TestServerEvents.prototype.createResponse = function () { return new TestServerEventsResponse(); };
                TestServerEvents.prototype.getTypeName = function () { return "TestServerEvents"; };
                return TestServerEvents;
            }());
            exports_1("TestServerEvents", TestServerEvents);
            // @Route("/scripts/{ScriptId}/status")
            GetScriptStatus = (function () {
                function GetScriptStatus() {
                }
                GetScriptStatus.prototype.createResponse = function () { return new ScriptStatusResponse(); };
                GetScriptStatus.prototype.getTypeName = function () { return "GetScriptStatus"; };
                return GetScriptStatus;
            }());
            exports_1("GetScriptStatus", GetScriptStatus);
            // @Route("/evaluate")
            EvaluateSource = (function () {
                function EvaluateSource() {
                }
                EvaluateSource.prototype.createResponse = function () { return new EvaluateSourceResponse(); };
                EvaluateSource.prototype.getTypeName = function () { return "EvaluateSource"; };
                return EvaluateSource;
            }());
            exports_1("EvaluateSource", EvaluateSource);
            // @Route("/nuget/packages/search/{Search}")
            SearchNugetPackages = (function () {
                function SearchNugetPackages() {
                }
                SearchNugetPackages.prototype.createResponse = function () { return new SearchNugetPackagesResponse(); };
                SearchNugetPackages.prototype.getTypeName = function () { return "SearchNugetPackages"; };
                return SearchNugetPackages;
            }());
            exports_1("SearchNugetPackages", SearchNugetPackages);
            // @Route("/packages/install")
            InstallNugetPackage = (function () {
                function InstallNugetPackage() {
                }
                InstallNugetPackage.prototype.createResponse = function () { return new InstallNugetPackageResponse(); };
                InstallNugetPackage.prototype.getTypeName = function () { return "InstallNugetPackage"; };
                return InstallNugetPackage;
            }());
            exports_1("InstallNugetPackage", InstallNugetPackage);
            // @Route("/packages/references")
            AddPackageAsReference = (function () {
                function AddPackageAsReference() {
                }
                AddPackageAsReference.prototype.createResponse = function () { return new AddPackageAsReferenceResponse(); };
                AddPackageAsReference.prototype.getTypeName = function () { return "AddPackageAsReference"; };
                return AddPackageAsReference;
            }());
            exports_1("AddPackageAsReference", AddPackageAsReference);
            // @Route("/packages/search/{Search}")
            SearchInstalledPackages = (function () {
                function SearchInstalledPackages() {
                }
                SearchInstalledPackages.prototype.createResponse = function () { return new SearchInstalledPackagesResponse(); };
                SearchInstalledPackages.prototype.getTypeName = function () { return "SearchInstalledPackages"; };
                return SearchInstalledPackages;
            }());
            exports_1("SearchInstalledPackages", SearchInstalledPackages);
            // @Route("/auth")
            // @Route("/auth/{provider}")
            // @Route("/authenticate")
            // @Route("/authenticate/{provider}")
            // @DataContract
            Authenticate = (function () {
                function Authenticate() {
                }
                Authenticate.prototype.createResponse = function () { return new AuthenticateResponse(); };
                Authenticate.prototype.getTypeName = function () { return "Authenticate"; };
                return Authenticate;
            }());
            exports_1("Authenticate", Authenticate);
            // @Route("/assignroles")
            // @DataContract
            AssignRoles = (function () {
                function AssignRoles() {
                }
                AssignRoles.prototype.createResponse = function () { return new AssignRolesResponse(); };
                AssignRoles.prototype.getTypeName = function () { return "AssignRoles"; };
                return AssignRoles;
            }());
            exports_1("AssignRoles", AssignRoles);
            // @Route("/unassignroles")
            // @DataContract
            UnAssignRoles = (function () {
                function UnAssignRoles() {
                }
                UnAssignRoles.prototype.createResponse = function () { return new UnAssignRolesResponse(); };
                UnAssignRoles.prototype.getTypeName = function () { return "UnAssignRoles"; };
                return UnAssignRoles;
            }());
            exports_1("UnAssignRoles", UnAssignRoles);
        }
    }
});
//# sourceMappingURL=Gistlyn.dtos.js.map