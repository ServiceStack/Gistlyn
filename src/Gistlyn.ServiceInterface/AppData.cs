using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using Gistlyn.ServiceModel.Types;

namespace Gistlyn.ServiceInterface
{
    public interface IDataContext
    {
        void SavePackage(NugetPackageInfo package);
        List<NugetPackageInfo> GetPackageAndDependencies(string packageId, string version);
        List<NugetPackageInfo> SearchPackages(string packageId, string version);
    }

    public class AppData : IDataContext
    {
        public string NugetPackagesDirectory { get; set; }

        readonly List<NugetPackageInfo> packages = new List<NugetPackageInfo>();

        readonly ConcurrentDictionary<string, MemoizedResult> memoizedResults = new ConcurrentDictionary<string, MemoizedResult>();

        public void SavePackage(NugetPackageInfo package)
        {
            lock (packages)
                packages.Add(package);
        }

        public List<NugetPackageInfo> GetPackageAndDependencies(string packageId, string version)
        {
            lock (packages)
                return packages.Where(p => p.Id == packageId && p.Ver == version).ToList();
        }

        public List<NugetPackageInfo> SearchPackages(string packageId, string version)
        {
            lock (packages)
                return packages.Where(x => packageId == null || x.Id.Contains(packageId)).OrderBy(x => x.Id).ToList();
        }

        public void SetMemoizedResult(MemoizedResult result)
        {
            memoizedResults[result.CodeHash] = result;
        }

        public MemoizedResult GetMemoizedResult(string codeHash)
        {
            MemoizedResult value;
            memoizedResults.TryGetValue(codeHash, out value);
            return value;
        }
    }
}
