// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Gistlyn.ServiceModel.Types;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Configuration;
using ServiceStack.Text;

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

        public string[] IllegalTokens { get; set; }

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

        public void AssertNoIllegalTokens(params string[] sources)
        {
            foreach (var source in sources)
            {
                if (source == null)
                    continue;

                if (source.IndexOfAny(IllegalTokens) > 0)
                    throw new ArgumentException("Illegal token detected");
            }
        }
    }

    public static class SharedAppHostConfig
    {
        public static DictionarySettings GetMemoryAppSettings()
        {
            return new DictionarySettings(new Dictionary<string, string>
            {
                {"oauth.RedirectUrl", "http://localhost:11001/"},
                {"oauth.CallbackUrl", "http://localhost:11001/auth/{0}"},
                {"oauth.github.Scopes", "user"},
                {"oauth.github.ClientId", "7e8a80ab55b757e7de05"},
                {"oauth.github.ClientSecret", "122eb4d2762190d024dca6a319bc7c602ee942a2"},
            });
        }

        public static void Configure(ServiceStackHost appHost, string defaultPackagesPath)
        {
            JsConfig.MaxDepth = 10;
            JsConfig.EmitCamelCaseNames = true;

            appHost.Plugins.Add(new ServerEventsFeature());

            appHost.Plugins.Add(new CorsFeature());

            appHost.Container.Register(new AppData(
                appHost.AppSettings.Get("NugetPackagesDirectory", defaultPackagesPath))
            {
                IllegalTokens = (appHost.AppSettings.GetString("IllegalTokens") ?? "Exit").FromJsv<string[]>()
            });

            appHost.Container.Register<IDataContext>(appHost.Container.Resolve<AppData>());

            appHost.Plugins.Add(new AuthFeature(() => new AuthUserSession(),
                new IAuthProvider[] {
                    new GithubAuthProvider(appHost.AppSettings),
                }));
        }
    }
}
