using System;
using System.Collections.Generic;
using System.Linq;
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
            info.Ver = package.Version.Version.ToString();

            info.Assemblies = package.AssemblyReferences.Select(a => new AssemblyReference(){ Name = a.Name, Path = a.Path }).ToList();

            return info;
        }
    }
}

