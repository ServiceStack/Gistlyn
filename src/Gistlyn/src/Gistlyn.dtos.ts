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


export interface IReturnVoid
{
}

export interface IReturn<T>
{
}

export class AssemblyReference
{
    name: string;
    path: string;
}

export class ScriptExecutionResult
{
    status: ScriptStatus;
    variables: VariableInfo[];
    errors: ErrorInfo[];
    errorResponseStatus: ResponseStatus;
    console: string;
}

// @DataContract
export class ResponseStatus
{
    // @DataMember(Order=1)
    errorCode: string;

    // @DataMember(Order=2)
    message: string;

    // @DataMember(Order=3)
    stackTrace: string;

    // @DataMember(Order=4)
    errors: ResponseError[];

    // @DataMember(Order=5)
    meta: { [index:string]: string; };
}

export type ScriptStatus = "Unknown" | "PrepareToRun" | "Running" | "Completed" | "Cancelled" | "CompiledWithErrors" | "ThrowedException" | "AnotherScriptExecuting";

export class VariableInfo
{
    name: string;
    value: string;
    type: string;
    json: string;
    isBrowseable: boolean;
}

export class NugetPackageInfo
{
    id: string;
    version: string;
    targetFramework: string;
    assemblies: AssemblyReference[];
}

export class ErrorInfo
{
    info: string;
}

// @DataContract
export class ResponseError
{
    // @DataMember(Order=1, EmitDefaultValue=false)
    errorCode: string;

    // @DataMember(Order=2, EmitDefaultValue=false)
    fieldName: string;

    // @DataMember(Order=3, EmitDefaultValue=false)
    message: string;

    // @DataMember(Order=4, EmitDefaultValue=false)
    meta: { [index:string]: string; };
}

export class RunScriptResponse
{
    result: ScriptExecutionResult;
    references: AssemblyReference[];
    scriptsRemoved: number;
    responseStatus: ResponseStatus;
}

export class ScriptStateVariables
{
    status: ScriptStatus;
    parentVariable: VariableInfo;
    variables: VariableInfo[];
}

export class EvaluateExpressionResponse
{
    result: ScriptExecutionResult;
    responseStatus: ResponseStatus;
}

export class CancelScriptResponse
{
    result: ScriptExecutionResult;
}

export class HelloResponse
{
    result: string;
    responseStatus: ResponseStatus;
}

export class TestServerEventsResponse
{
    result: string;
}

export class ScriptStatusResponse
{
    status: ScriptStatus;
}

export class EvaluateSourceResponse
{
    result: ScriptExecutionResult;
}

export class SearchNugetPackagesResponse
{
    packages: NugetPackageInfo[];
}

export class InstallNugetPackageResponse
{
    error: string;
}

export class AddPackageAsReferenceResponse
{
    assemblies: AssemblyReference[];
}

export class SearchInstalledPackagesResponse
{
    packages: NugetPackageInfo[];
}

// @DataContract
export class AuthenticateResponse
{
    // @DataMember(Order=1)
    userId: string;

    // @DataMember(Order=2)
    sessionId: string;

    // @DataMember(Order=3)
    userName: string;

    // @DataMember(Order=4)
    displayName: string;

    // @DataMember(Order=5)
    referrerUrl: string;

    // @DataMember(Order=6)
    bearerToken: string;

    // @DataMember(Order=7)
    responseStatus: ResponseStatus;

    // @DataMember(Order=8)
    meta: { [index:string]: string; };
}

// @DataContract
export class AssignRolesResponse
{
    // @DataMember(Order=1)
    allRoles: string[];

    // @DataMember(Order=2)
    allPermissions: string[];

    // @DataMember(Order=3)
    responseStatus: ResponseStatus;
}

// @DataContract
export class UnAssignRolesResponse
{
    // @DataMember(Order=1)
    allRoles: string[];

    // @DataMember(Order=2)
    allPermissions: string[];

    // @DataMember(Order=3)
    responseStatus: ResponseStatus;
}

// @Route("/scripts/{ScriptId}/run")
export class RunScript implements IReturn<RunScriptResponse>
{
    scriptId: string;
    mainSource: string;
    sources: string[];
    packagesConfig: string;
    references: AssemblyReference[];
    forceRun: boolean;
    createResponse() { return new RunScriptResponse(); }
    getTypeName() { return "RunScript"; }
}

// @Route("/scripts/{ScriptId}/vars")
// @Route("/scripts/{ScriptId}/vars/{VariableName}")
export class GetScriptVariables implements IReturn<ScriptStateVariables>
{
    scriptId: string;
    variableName: string;
    createResponse() { return new ScriptStateVariables(); }
    getTypeName() { return "GetScriptVariables"; }
}

// @Route("/scripts/{ScriptId}/evaluate")
export class EvaluateExpression implements IReturn<EvaluateExpressionResponse>
{
    scriptId: string;
    expression: string;
    includeJson: boolean;
    createResponse() { return new EvaluateExpressionResponse(); }
    getTypeName() { return "EvaluateExpression"; }
}

// @Route("/scripts/{ScriptId}/cancel")
export class CancelScript implements IReturn<CancelScriptResponse>
{
    scriptId: string;
    createResponse() { return new CancelScriptResponse(); }
    getTypeName() { return "CancelScript"; }
}

export class Hello implements IReturn<HelloResponse>
{
    name: string;
    createResponse() { return new HelloResponse(); }
    getTypeName() { return "Hello"; }
}

// @Route("/test")
// @Route("/test/{Name}")
export class TestServerEvents implements IReturn<TestServerEventsResponse>
{
    name: string;
    createResponse() { return new TestServerEventsResponse(); }
    getTypeName() { return "TestServerEvents"; }
}

// @Route("/scripts/{ScriptId}/status")
export class GetScriptStatus implements IReturn<ScriptStatusResponse>
{
    scriptId: string;
    createResponse() { return new ScriptStatusResponse(); }
    getTypeName() { return "GetScriptStatus"; }
}

// @Route("/evaluate")
export class EvaluateSource implements IReturn<EvaluateSourceResponse>
{
    code: string;
    createResponse() { return new EvaluateSourceResponse(); }
    getTypeName() { return "EvaluateSource"; }
}

// @Route("/nuget/packages/search/{Search}")
export class SearchNugetPackages implements IReturn<SearchNugetPackagesResponse>
{
    search: string;
    allowPrereleaseVersion: boolean;
    createResponse() { return new SearchNugetPackagesResponse(); }
    getTypeName() { return "SearchNugetPackages"; }
}

// @Route("/packages/install")
export class InstallNugetPackage implements IReturn<InstallNugetPackageResponse>
{
    packageId: string;
    version: string;
    allowPrereleaseVersion: boolean;
    createResponse() { return new InstallNugetPackageResponse(); }
    getTypeName() { return "InstallNugetPackage"; }
}

// @Route("/packages/references")
export class AddPackageAsReference implements IReturn<AddPackageAsReferenceResponse>
{
    packageId: string;
    version: string;
    createResponse() { return new AddPackageAsReferenceResponse(); }
    getTypeName() { return "AddPackageAsReference"; }
}

// @Route("/packages/search/{Search}")
export class SearchInstalledPackages implements IReturn<SearchInstalledPackagesResponse>
{
    search: string;
    createResponse() { return new SearchInstalledPackagesResponse(); }
    getTypeName() { return "SearchInstalledPackages"; }
}

// @Route("/auth")
// @Route("/auth/{provider}")
// @Route("/authenticate")
// @Route("/authenticate/{provider}")
// @DataContract
export class Authenticate implements IReturn<AuthenticateResponse>
{
    // @DataMember(Order=1)
    provider: string;

    // @DataMember(Order=2)
    state: string;

    // @DataMember(Order=3)
    oauth_token: string;

    // @DataMember(Order=4)
    oauth_verifier: string;

    // @DataMember(Order=5)
    userName: string;

    // @DataMember(Order=6)
    password: string;

    // @DataMember(Order=7)
    rememberMe: boolean;

    // @DataMember(Order=8)
    continue: string;

    // @DataMember(Order=9)
    nonce: string;

    // @DataMember(Order=10)
    uri: string;

    // @DataMember(Order=11)
    response: string;

    // @DataMember(Order=12)
    qop: string;

    // @DataMember(Order=13)
    nc: string;

    // @DataMember(Order=14)
    cnonce: string;

    // @DataMember(Order=15)
    useTokenCookie: boolean;

    // @DataMember(Order=16)
    meta: { [index:string]: string; };
    createResponse() { return new AuthenticateResponse(); }
    getTypeName() { return "Authenticate"; }
}

// @Route("/assignroles")
// @DataContract
export class AssignRoles implements IReturn<AssignRolesResponse>
{
    // @DataMember(Order=1)
    userName: string;

    // @DataMember(Order=2)
    permissions: string[];

    // @DataMember(Order=3)
    roles: string[];
    createResponse() { return new AssignRolesResponse(); }
    getTypeName() { return "AssignRoles"; }
}

// @Route("/unassignroles")
// @DataContract
export class UnAssignRoles implements IReturn<UnAssignRolesResponse>
{
    // @DataMember(Order=1)
    userName: string;

    // @DataMember(Order=2)
    permissions: string[];

    // @DataMember(Order=3)
    roles: string[];
    createResponse() { return new UnAssignRolesResponse(); }
    getTypeName() { return "UnAssignRoles"; }
}
