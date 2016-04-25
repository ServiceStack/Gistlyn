using System;
using System.Collections.Generic;
using Gistlyn.Common.Interfaces;
using Gistlyn.Common.Objects;
using ServiceStack.Data;
using ServiceStack;
using System.Linq;
using ServiceStack.OrmLite;

namespace Gistlyn.DataContext
{
    public class GistlynDataContext : IDataContext
    {
        IDbConnectionFactory dbFactory;

        public GistlynDataContext(IDbConnectionFactory dbFactory)
        {
            this.dbFactory = dbFactory; 
        }

        public void SavePackage(NugetPackageInfo package)
        {
            using (var db = dbFactory.Open())
            {
                if (db.CreateTableIfNotExists<NugetPackageInfo>())
                {
                    db.Insert(package);
                }
            }
        }

        public List<NugetPackageInfo> GetPackageAndDependencies(string packageId, string version)
        {
            List<NugetPackageInfo> packages = new List<NugetPackageInfo>();

            using (var db = dbFactory.Open())
            {
                var q = db.From<NugetPackageInfo>().Where(p => p.Id == packageId && p.Ver == version);

                packages = db.Select<NugetPackageInfo>(q);
            }

            return packages;
        }

        public List<NugetPackageInfo> SearchPackages(string packageId, string version)
        {
            List<NugetPackageInfo> packages;

            using (var db = dbFactory.Open())
            {
                packages = db.Select<NugetPackageInfo>(p => p.Id.Contains(packageId));
            }

            return packages;
        }

    }
}


