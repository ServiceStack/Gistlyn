// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

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
        public AppData(string nugetPackagesDirectory)
        {
            NugetPackagesDirectory = nugetPackagesDirectory;
            packagesIndex = NugetPackagesDirectory.CombineWith("packages.json");
            if (File.Exists(packagesIndex))
            {
                var json = File.ReadAllText(packagesIndex);
                Packages = json.FromJson<List<NugetPackageInfo>>();
            }
        }

        private readonly string packagesIndex;
        public string NugetPackagesDirectory { get; set; }

        public List<NugetPackageInfo> Packages = new List<NugetPackageInfo>();

        readonly ConcurrentDictionary<string, MemoizedResult> memoizedResults = new ConcurrentDictionary<string, MemoizedResult>();

        public void SavePackage(NugetPackageInfo package)
        {
            lock (Packages)
            {
                Packages.Add(package);
                File.WriteAllText(packagesIndex, Packages.ToJson());
            }
        }

        public List<NugetPackageInfo> GetPackageAndDependencies(string packageId, string version)
        {
            lock (Packages)
                return Packages.Where(p => p.Id == packageId && p.Version == version).ToList();
        }

        public List<NugetPackageInfo> SearchPackages(string packageId, string version)
        {
            lock (Packages)
                return Packages.Where(x => packageId == null || x.Id.Contains(packageId)).OrderBy(x => x.Id).ToList();
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
