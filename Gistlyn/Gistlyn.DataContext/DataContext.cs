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
                if (db.TableExists(typeof(NugetPackageInfo).Name) || db.CreateTableIfNotExists<NugetPackageInfo>())
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
                if (db.TableExists(typeof(NugetPackageInfo).Name))
                {
                    var q = db.From<NugetPackageInfo>().Where(p => p.Id == packageId && p.Ver == version);

                    packages = db.Select<NugetPackageInfo>(q);
                }
            }

            return packages;
        }

        public List<NugetPackageInfo> SearchPackages(string packageId, string version)
        {
            List<NugetPackageInfo> packages;

            using (var db = dbFactory.Open())
            {
                var q = !String.IsNullOrEmpty(packageId)
                               ? db.From<NugetPackageInfo>().Where(p => p.Id.Contains(packageId)).OrderBy(p => p.Id)
                               : db.From<NugetPackageInfo>().OrderBy(p => p.Id);

                packages = db.Select<NugetPackageInfo>(q);
            }

            return packages;
        }

        public string GetMemoizedResult(string codeHash)
        {
            List<MemoizedResult> results = null;

            using (var db = dbFactory.Open())
            {
                if (db.TableExists(typeof(MemoizedResult).Name))
                {
                    var q = db.From<MemoizedResult>().Where(r => r.CodeHash == codeHash);
                    results = db.Select<MemoizedResult>(q);
                }
            }

            return results != null && results.Count > 0 ? results[0].Result : null;
        }

        public void AddMemoizedResult(MemoizedResult result)
        {
            using (var db = dbFactory.Open())
            {
                if (db.TableExists(typeof(MemoizedResult).Name) || db.CreateTableIfNotExists<MemoizedResult>())
                {
                    db.Insert(result);
                }
            }
        }


    }
}


