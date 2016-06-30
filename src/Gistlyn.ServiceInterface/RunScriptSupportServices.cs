#if ASPNET
using System;
using System.Linq;
using Gistlyn.ServiceModel;
using Gistlyn.ServiceModel.Types;
using Gistlyn.SnippetEngine;
using NuGet;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    /// <summary>
    /// Non essential Services we can remove later
    /// </summary>
    public class RunScriptSupportServices : Service
    {
        public IServerEvents ServerEvents { get; set; }

        public object Any(Hello request)
        {
            return new HelloResponse { Result = "Hello, {0}!".Fmt(request.Name) };
        }

        public object Any(TestServerEvents request)
        {
            var response = new TestServerEventsResponse { Result = "Hello, {0}!".Fmt(request.Name) };

            try
            {
                ServerEvents.NotifySession(Request.GetSessionId(), response, "@channels");
                ServerEvents.NotifyUserId(request.Name, response, "@channels");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return response;
        }

        public object Any(GetScriptStatus request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            return new ScriptStatusResponse
            {
                Status = wrapper != null ? wrapper.GetScriptStatus() : ScriptStatus.Unknown
            };
        }

        public object Any(EvaluateSource request)
        {
            var runner = new ScriptRunner();
            var response = new EvaluateSourceResponse();

            try
            {
                response.Result = runner.Execute(request.Code).Result;
            }
            catch (Exception e)
            {
                response.Result = new ScriptExecutionResult { Exception = e };
            }

            return response;
        }
    }

    public class NugetService : Service
    {
        public AppData AppData { get; set; }

        public IDataContext DataContext { get; set; }

        public object Any(SearchNugetPackages request)
        {
            var repo = PackageRepositoryFactory.Default.CreateRepository("https://packages.nuget.org/api/v2");

            var packages = repo.Search(request.Search, request.AllowPrereleaseVersion)
                .Take(50)
                .ToList();

            var packageInfos = packages
                .Select(p => new NugetPackageInfo { Id = p.Id, Version = p.Version.ToNormalizedString() })
                .ToList();

            return new SearchNugetPackagesResponse
            {
                Packages = packageInfos
            };
        }

        public object Any(InstallNugetPackage request)
        {
            NugetUtils.InstallPackage(DataContext, AppData.NugetPackagesDirectory, request.PackageId, request.Version);

            return new InstallNugetPackageResponse();
        }

        public object Any(AddPackageAsReference request)
        {
            return new AddPackageAsReferenceResponse
            {
                Assemblies = NugetUtils.RestorePackage(DataContext, AppData.NugetPackagesDirectory, request.PackageId, request.Version)
            };
        }

        public object Any(SearchInstalledPackages request)
        {
            var packages = DataContext.SearchPackages(request.Search, null);

            return new SearchInstalledPackagesResponse
            {
                Packages = packages
            };
        }
    }
}
#endif
