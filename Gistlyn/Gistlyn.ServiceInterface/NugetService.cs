using System;
using System.Collections.Generic;
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
        public WebHostConfig Config { get; set; }

        public IDataContext DataContext { get; set; }

        public object Any(SearchNugetPackage request)
        {
            IPackageRepository repo = PackageRepositoryFactory.Default.CreateRepository("https://packages.nuget.org/api/v2");

            var packages = repo.Search(request.Search, request.AllowPrereleaseVersion)
                               .Take(50)
                               .ToList();

            List<NugetPackageInfo> packageInfos = packages
                                                  .Select(p => new NugetPackageInfo() { Id = p.Id, Version = p.Version.Version, Ver = p.Version.Version.ToString()})
                                                  .ToList();

            return packageInfos;
        }

        public object Any(InstallNugetPackage request)
        {
            //Connect to the official package repository
            IPackageRepository repo = PackageRepositoryFactory.Default.CreateRepository("https://packages.nuget.org/api/v2");

            //Initialize the package manager
            string path = Config.NugetPackagesDirectory;
            PackageManager packageManager = new PackageManager(repo, path);

            packageManager.PackageInstalled += new EventHandler<PackageOperationEventArgs>(delegate (object sender, PackageOperationEventArgs e)
            {
                var info = e.Package.GetPackageInfo();

                DataContext.SavePackage(info);
            });
                

            //Download and unzip the package
            packageManager.InstallPackage(request.PackageId, SemanticVersion.Parse(request.Ver)); //new SemanticVersion(request.Version)

            return new InstallNugetPackageResponse();
        }

        public object Any(AddPackageAsReference request)
        {
            List<NugetPackageInfo> packages = DataContext.GetPackageAndDependencies(request.PackageId, request.Version);

            List<AssemblyReference> assemblies = new List<AssemblyReference>();

            foreach (var package in packages)
            {
                assemblies.AddRange(package.Assemblies);
            }

            return new AddPackageAsReferenceResponse()
            {
                Assemblies = assemblies.GroupBy(a => a.Name).Select(g => g.First()).ToList()
            };
        }

        }
}

