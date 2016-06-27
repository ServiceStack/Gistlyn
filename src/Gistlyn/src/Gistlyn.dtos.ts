/* Options:
Date: 2016-06-27 01:11:26
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


module Gistlyn.ServiceModel
{

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

    export const enum ScriptStatus
    {
        unknown,
        prepareToRun,
        running,
        completed,
        cancelled,
        compiledWithErrors,
        throwedException,
        anotherScriptExecuting,
    }

    export class VariableInfo
    {
        name: string;
        value: string;
        type: string;
        isBrowseable: boolean;
    }

    export class ScriptExecutionResult
    {
        status: string;
        variables: VariableInfo[];
        errors: ErrorInfo[];
        errorResponseStatus: ResponseStatus;
        console: string;
    }

    export class AssemblyReference
    {
        name: string;
        path: string;
    }

    export class EmbedScriptExecutionResult
    {
        status: string;
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
        status: string;
        name: string;
        json: string;
    }

    export class ScriptStateVariables
    {
        status: string;
        parentVariable: VariableInfo;
        variables: VariableInfo[];
    }

    export class ScriptStatusResponse
    {
        status: string;
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
    }

    // @Route("/test")
    // @Route("/test/{Name}")
    export class TestServerEvents implements IReturn<TestServerEventsResponse>
    {
        name: string;
    }

    // @Route("/scripts/{ScriptId}/vars/{VariableName}/json")
    export class GetScriptVariableJson implements IReturn<ScriptVariableJson>
    {
        scriptId: string;
        variableName: string;
    }

    // @Route("/scripts/evaluate")
    export class EvaluateExpression
    {
        scriptId: string;
        expression: string;
    }

    // @Route("/scripts/{ScriptId}/vars/{VariableName}")
    export class GetScriptVariables implements IReturn<ScriptStateVariables>
    {
        scriptId: string;
        variableName: string;
    }

    // @Route("/scripts/{ScriptId}/status")
    export class GetScriptStatus implements IReturn<ScriptStatusResponse>
    {
        scriptId: string;
    }

    // @Route("/evaluate")
    export class EvaluateSource implements IReturn<EvaluateSourceResponse>
    {
        code: string;
    }

    // @Route("/scripts/{ScriptId}/cancel")
    export class CancelScript implements IReturn<CancelScriptResponse>
    {
        scriptId: string;
    }

    // @Route("/embed-scripts/{ScriptId}/cancel")
    export class CancelEmbedScript implements IReturn<CancelEmbedScriptResponse>
    {
        scriptId: string;
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
    }

    // @Route("/nuget/packages/search/{Search}")
    export class SearchNugetPackages implements IReturn<SearchNugetPackagesResponse>
    {
        search: string;
        allowPrereleaseVersion: boolean;
    }

    // @Route("/packages/install")
    export class InstallNugetPackage implements IReturn<InstallNugetPackageResponse>
    {
        packageId: string;
        version: string;
        allowPrereleaseVersion: boolean;
    }

    // @Route("/packages/references")
    export class AddPackageAsReference implements IReturn<AddPackageAsReferenceResponse>
    {
        packageId: string;
        version: string;
    }

    // @Route("/packages/search/{Search}")
    export class SearchInstalledPackages implements IReturn<SearchInstalledPackagesResponse>
    {
        search: string;
    }

    // @Route("/gists/{Gist}/embed")
    export class GetEmbedScript
    {
        gist: string;
        noCache: boolean;
    }

}
