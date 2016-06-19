using System.Linq;
using Gistlyn.Common.Interfaces;
using Gistlyn.Common.Objects;
using Gistlyn.ServiceModel;
using NuGet;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
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
                .Select(p => new NugetPackageInfo { Id = p.Id, Version = p.Version.Version, Ver = p.Version.Version.ToString() })
                .ToList();

            return new SearchNugetPackagesResponse
            {
                Packages = packageInfos
            };
        }

        public object Any(InstallNugetPackage request)
        {
            NugetHelper.InstallPackage(DataContext, AppData.NugetPackagesDirectory, request.PackageId, request.Ver);

            return new InstallNugetPackageResponse();
        }

        public object Any(AddPackageAsReference request)
        {
            return new AddPackageAsReferenceResponse
            {
                Assemblies = NugetHelper.RestorePackage(DataContext, AppData.NugetPackagesDirectory, request.PackageId, request.Version)
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

