using System.Collections.Generic;
using System.Linq;
using Gistlyn.Common.Interfaces;
using Gistlyn.Common.Objects;

namespace Gistlyn.ServiceInterface
{
    public class MemoryDataContext : IDataContext
    {
        readonly List<NugetPackageInfo> packages = new List<NugetPackageInfo>();

        readonly List<MemoizedResult> results = new List<MemoizedResult>();

        public void SavePackage(NugetPackageInfo package)
        {
            lock (packages)
            {
                packages.Add(package);
            }
        }

        public List<NugetPackageInfo> GetPackageAndDependencies(string packageId, string version)
        {
            return packages.Where(p => p.Id == packageId && p.Ver == version).ToList();
        }

        public List<NugetPackageInfo> SearchPackages(string packageId, string version)
        {
            return packages.Where(x => packageId == null || x.Id.Contains(packageId)).OrderBy(x => x.Id).ToList();
        }

        public void AddMemoizedResult(MemoizedResult result)
        {
            results.Add(result);
        }

        public MemoizedResult GetMemoizedResult(string codeHash)
        {
            return results.FirstOrDefault(x => x.CodeHash == codeHash);
        }
    }
}