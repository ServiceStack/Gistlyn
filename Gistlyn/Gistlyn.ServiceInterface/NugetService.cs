using System;
using System.Collections.Generic;
using System.Linq;
using Gistlyn.Common.Objects;
using Gistlyn.ServiceModel;
using NuGet;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public class NugetService : Service
    {
        public WebHostConfig Config { get; set; }

        public object Any(SearchNugetPackage request)
        {
            IPackageRepository repo = PackageRepositoryFactory.Default.CreateRepository("https://packages.nuget.org/api/v2");

            List<NugetPackageInfo> packages = repo.Search(request.Search, request.AllowPrereleaseVersion)
                                                  .Take(50)
                                                  .ToList()
                                                  .Select(p => new NugetPackageInfo() { Id = p.Id, Version = p.Version.Version, Ver = p.Version.Version.ToString()})
                                                  .ToList();

            return packages;
        }

        public object Any(InstallNugetPackage request)
        {
            //Connect to the official package repository
            IPackageRepository repo = PackageRepositoryFactory.Default.CreateRepository("https://packages.nuget.org/api/v2");

            //Initialize the package manager
            string path = Config.NugetPackagesDirectory;
            PackageManager packageManager = new PackageManager(repo, path);

            //Download and unzip the package
            packageManager.InstallPackage(request.PackageId, SemanticVersion.Parse(request.Ver)); //new SemanticVersion(request.Version)

            return new InstallNugetPackageResponse();
        }
    }
}

