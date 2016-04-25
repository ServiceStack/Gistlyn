using System;
using System.Collections.Generic;
using Gistlyn.Common.Objects;

namespace Gistlyn.Common.Interfaces
{
    public interface IDataContext
    {
        void SavePackage(NugetPackageInfo package);
        List<NugetPackageInfo> GetPackageAndDependencies(string packageId, string version);
        List<NugetPackageInfo> SearchPackages(string packageId, string version);
    }
}


