using System.Collections.Generic;
using System.IO;
using System.Linq;
using Gistlyn.ServiceModel.Types;
using NuGet;

namespace Gistlyn.ServiceInterface
{
    public static class NugetHelper
    {
        public static NugetPackageInfo GetPackageInfo(this IPackage package)
        {
            var info = new NugetPackageInfo
            {
                Id = package.Id,
                Version = package.Version.ToNormalizedString()
            };

            info.Assemblies = package.AssemblyReferences
                .Select(a => new AssemblyReference
                {
                    Name = a.Name,
                    Path = Path.Combine(info.Id + "." + package.Version.ToNormalizedString(), a.Path)
                })
                .ToList();

            return info;
        }

        public static void InstallPackage(IDataContext dataContext, string nugetPackagesDir, string packageId, string version)
        {
            //Connect to the official package repository
            var repo = PackageRepositoryFactory.Default.CreateRepository("https://packages.nuget.org/api/v2");

            //Initialize the package manager
            var packageManager = new PackageManager(repo, nugetPackagesDir);

            packageManager.PackageInstalled += (sender, e) =>
            {
                var info = e.Package.GetPackageInfo();

                dataContext.SavePackage(info);
            };

            //Download and unzip the package
            packageManager.InstallPackage(packageId, SemanticVersion.Parse(version)); //new SemanticVersion(request.Version)

        }

        public static List<AssemblyReference> RestorePackage(IDataContext dataContext, string nugetPackagesDir, string packageId, string version)
        {
            var packages = dataContext.GetPackageAndDependencies(packageId, version);

            //trying to install first
            if (packages.Count == 0)
            {
                InstallPackage(dataContext, nugetPackagesDir, packageId, version);
                packages = dataContext.GetPackageAndDependencies(packageId, version);
            }

            var assemblies = new List<AssemblyReference>();

            foreach (var package in packages)
            {
                var ftAssemblies = new List<FrameworkTargetableAssembly>();
                foreach (var asm in package.Assemblies)
                {
                    var ft = new FrameworkTargetableAssembly(asm);
                    ftAssemblies.Add(ft);
                }

                IEnumerable<FrameworkTargetableAssembly> compatibleLibs;
                var projectFramework = VersionUtility.ParseFrameworkName("net45");
                VersionUtility.TryGetCompatibleItems(projectFramework, ftAssemblies, out compatibleLibs);

                var bestCompatible = compatibleLibs.FirstOrDefault();

                if (bestCompatible != null)
                    assemblies.Add(bestCompatible.Assembly);
            }

            assemblies = assemblies.GroupBy(a => a.Name).Select(g => g.First()).ToList();

            return assemblies;
        }
    }
}

