using System;
using System.Collections.Generic;
using Gistlyn.Common.Interfaces;
using Gistlyn.Common.Objects;

namespace Gistlyn.DataContext
{
    public class GistlynDataContext : IDataContext
    {
        public void SavePackage(NugetPackageInfo package)
        {
            //TODO: save to database
            
        }

        public List<NugetPackageInfo> GetPackageAndDependencies(string packageId, string version)
        {
            List<NugetPackageInfo> packages = new List<NugetPackageInfo>();

            //TODO: read from database 

            return packages;
        }
    }
}


