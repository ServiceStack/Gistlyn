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


export interface IReturnVoid
{
}

export interface IReturn<T>
{
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

export class ScriptExecutionResult
{
    status: ScriptStatus;
    variables: VariableInfo[];
    errors: ErrorInfo[];
    errorResponseStatus: ResponseStatus;
    console: string;
}

export class VariableInfo
{
    name: string;
    value: string;
    type: string;
    json: string;
    isBrowseable: boolean;
}

export class AssemblyReference
{
    name: string;
    path: string;
}

export class EmbedScriptExecutionResult
{
    status: ScriptStatus;
    errors: ErrorInfo[];
    errorResponseStatus: ResponseStatus;
    lastVariableJson: ScriptVariableJson;
}

export class NugetPackageInfo
{
    id: string;
    version: string;
    targetFramework: string;
    assemblies: AssemblyReference[];
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

export class ErrorInfo
{
    info: string;
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

export class ScriptVariableJson
{
    status: ScriptStatus;
    name: string;
    json: string;
}

export class EvaluateExpressionResponse
{
    result: ScriptExecutionResult;
    responseStatus: ResponseStatus;
}

export class ScriptStateVariables
{
    status: ScriptStatus;
    parentVariable: VariableInfo;
    variables: VariableInfo[];
}

export class ScriptStatusResponse
{
    status: ScriptStatus;
}

export class EvaluateSourceResponse
{
    result: ScriptExecutionResult;
}

export class CancelScriptResponse
{
    result: ScriptExecutionResult;
}

export class CancelEmbedScriptResponse
{
    result: ScriptExecutionResult;
}

export class RunScriptResponse
{
    result: ScriptExecutionResult;
    references: AssemblyReference[];
    responseStatus: ResponseStatus;
}

export class RunEmbedScriptResponse
{
    result: EmbedScriptExecutionResult;
    references: AssemblyReference[];
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

export class Hello implements IReturn<HelloResponse>
{
    name: string;
    createResponse() { return new HelloResponse(); }
}

// @Route("/test")
// @Route("/test/{Name}")
export class TestServerEvents implements IReturn<TestServerEventsResponse>
{
    name: string;
    createResponse() { return new TestServerEventsResponse(); }
}

// @Route("/scripts/{ScriptId}/vars/{VariableName}/json")
export class GetScriptVariableJson implements IReturn<ScriptVariableJson>
{
    scriptId: string;
    variableName: string;
    createResponse() { return new ScriptVariableJson(); }
}

// @Route("/scripts/{ScriptId}/evaluate")
export class EvaluateExpression implements IReturn<EvaluateExpressionResponse>
{
    scriptId: string;
    expression: string;
    includeJson: boolean;
    createResponse() { return new EvaluateExpressionResponse(); }
}

// @Route("/scripts/{ScriptId}/vars")
// @Route("/scripts/{ScriptId}/vars/{VariableName}")
export class GetScriptVariables implements IReturn<ScriptStateVariables>
{
    scriptId: string;
    variableName: string;
    createResponse() { return new ScriptStateVariables(); }
}

// @Route("/scripts/{ScriptId}/status")
export class GetScriptStatus implements IReturn<ScriptStatusResponse>
{
    scriptId: string;
    createResponse() { return new ScriptStatusResponse(); }
}

// @Route("/evaluate")
export class EvaluateSource implements IReturn<EvaluateSourceResponse>
{
    code: string;
    createResponse() { return new EvaluateSourceResponse(); }
}

// @Route("/scripts/{ScriptId}/cancel")
export class CancelScript implements IReturn<CancelScriptResponse>
{
    scriptId: string;
    createResponse() { return new CancelScriptResponse(); }
}

// @Route("/embed-scripts/{ScriptId}/cancel")
export class CancelEmbedScript implements IReturn<CancelEmbedScriptResponse>
{
    scriptId: string;
    createResponse() { return new CancelEmbedScriptResponse(); }
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
}

// @Route("/embed-scripts/{ScriptId}/gists/{GistHash}/run")
export class RunEmbedScript implements IReturn<RunEmbedScriptResponse>
{
    scriptId: string;
    gistHash: string;
    mainSource: string;
    sources: string[];
    references: AssemblyReference[];
    packages: string;
    noCache: boolean;
    createResponse() { return new RunEmbedScriptResponse(); }
}

// @Route("/nuget/packages/search/{Search}")
export class SearchNugetPackages implements IReturn<SearchNugetPackagesResponse>
{
    search: string;
    allowPrereleaseVersion: boolean;
    createResponse() { return new SearchNugetPackagesResponse(); }
}

// @Route("/packages/install")
export class InstallNugetPackage implements IReturn<InstallNugetPackageResponse>
{
    packageId: string;
    version: string;
    allowPrereleaseVersion: boolean;
    createResponse() { return new InstallNugetPackageResponse(); }
}

// @Route("/packages/references")
export class AddPackageAsReference implements IReturn<AddPackageAsReferenceResponse>
{
    packageId: string;
    version: string;
    createResponse() { return new AddPackageAsReferenceResponse(); }
}

// @Route("/packages/search/{Search}")
export class SearchInstalledPackages implements IReturn<SearchInstalledPackagesResponse>
{
    search: string;
    createResponse() { return new SearchInstalledPackagesResponse(); }
}

// @Route("/gists/{Gist}/embed")
export class GetEmbedScript
{
    gist: string;
    noCache: boolean;
}
