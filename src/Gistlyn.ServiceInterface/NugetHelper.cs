using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Versioning;
using Gistlyn.Common.Interfaces;
using Gistlyn.Common.Objects;
using NuGet;

namespace Gistlyn.ServiceInterface
{
    public static class NugetHelper
    {
        public static NugetPackageInfo GetPackageInfo(this IPackage package)
        {
            NugetPackageInfo info = new NugetPackageInfo();

            info.Id = package.Id;
            info.Version = package.Version.Version;
            info.Ver = package.Version.ToNormalizedString();

            info.Assemblies = package.AssemblyReferences
                .Select(a => new AssemblyReference()
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
            IPackageRepository repo = PackageRepositoryFactory.Default.CreateRepository("https://packages.nuget.org/api/v2");

            //Initialize the package manager
            string path = nugetPackagesDir;
            PackageManager packageManager = new PackageManager(repo, path);

            packageManager.PackageInstalled += new EventHandler<PackageOperationEventArgs>(delegate (object sender, PackageOperationEventArgs e)
            {
                var info = e.Package.GetPackageInfo();

                dataContext.SavePackage(info);
            });

            //Download and unzip the package
            packageManager.InstallPackage(packageId, SemanticVersion.Parse(version)); //new SemanticVersion(request.Version)

        }

        public static List<AssemblyReference> RestorePackage(IDataContext dataContext, string nugetPackagesDir, string packageId, string version)
        {
            List<NugetPackageInfo> packages = dataContext.GetPackageAndDependencies(packageId, version);

            //trying to install first
            if (packages.Count == 0)
            {
                InstallPackage(dataContext, nugetPackagesDir, packageId, version);
                packages = dataContext.GetPackageAndDependencies(packageId, version);
            }

            List<AssemblyReference> assemblies = new List<AssemblyReference>();

            foreach (var package in packages)
            {
                List<FrameworkTargetableAssembly> ftAssemblies = new List<FrameworkTargetableAssembly>();
                foreach (var asm in package.Assemblies)
                {
                    FrameworkTargetableAssembly ft = new FrameworkTargetableAssembly(asm);
                    ftAssemblies.Add(ft);
                }

                IEnumerable<FrameworkTargetableAssembly> compatibleLibs;
                FrameworkName projectFramework = VersionUtility.ParseFrameworkName("net45");
                VersionUtility.TryGetCompatibleItems<FrameworkTargetableAssembly>(projectFramework, ftAssemblies, out compatibleLibs);

                var bestCompatible = compatibleLibs.FirstOrDefault();

                if (bestCompatible != null)
                    assemblies.Add(bestCompatible.Assembly);
            }

            assemblies = assemblies.GroupBy(a => a.Name).Select(g => g.First()).ToList();

            return assemblies;
        }
    }
}

