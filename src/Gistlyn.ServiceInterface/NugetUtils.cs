// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Versioning;
using Gistlyn.ServiceModel.Types;
using NuGet;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public static class NugetUtils
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

        private static readonly FrameworkName Net45FrameworkName = VersionUtility.ParseFrameworkName("net45");

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
            var uniqueNames = new HashSet<string>();

            foreach (var package in packages)
            {
                //Add preferred .NET 4.5 dlls first (if any)
                foreach (var assembly in package.Assemblies)
                {
                    var fxName = GetFrameworkName(assembly);
                    if (fxName == Net45FrameworkName)
                    {
                        assemblies.Add(assembly);
                        uniqueNames.Add(assembly.Name);
                    }
                }

                foreach (var assembly in package.Assemblies)
                {
                    var fxName = GetFrameworkName(assembly);
                    if (fxName != null &&
                        VersionUtility.IsCompatible(Net45FrameworkName, new[] { fxName }) &&
                        !uniqueNames.Contains(assembly.Name))
                    {
                        assemblies.Add(assembly);
                        uniqueNames.Add(assembly.Name);
                    }
                }
            }

            return assemblies;
        }

        private static FrameworkName GetFrameworkName(AssemblyReference assembly)
        {
            string effectivePath;
            var fxName = VersionUtility.ParseFrameworkNameFromFilePath(assembly.Path, out effectivePath);
            if (fxName != null)
                return fxName;

            if (assembly.Path.IndexOf("lib" + Path.DirectorySeparatorChar, StringComparison.Ordinal) == -1)
                return null;

            var libDirName = assembly.Path.RightPart("lib" + Path.DirectorySeparatorChar).LeftPart(Path.DirectorySeparatorChar);
            return VersionUtility.ParseFrameworkName(libDirName);
        }
    }
}

