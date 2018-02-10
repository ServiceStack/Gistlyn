﻿// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
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
            memoizedResults.TryGetValue(codeHash, out var value);
            return value;
        }

        public void AssertNoIllegalTokens(params string[] sources)
        {
            foreach (var source in sources)
            {
                if (source?.IndexOfAny(IllegalTokens) > 0)
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
                {"oauth.RedirectUrl", "http://localhost:4000/"},
                {"oauth.CallbackUrl", "http://localhost:4000/auth/{0}"},
                {"oauth.github.Scopes", "user:email,gist"},
                {"oauth.github.ClientId", "8e66a75de4e62dd97696"},
                {"oauth.github.ClientSecret", "fbdd3b95497295fc0776527206c8e40159d1da6d"},
                {"jwt.AuthKeyBase64", "+k5WFGc2qKS9NuwIM7OBOA7vT2AKXhCxRpCUgibVv8E="},
                {"jwt.RequireSecureConnection", "False"},
            });
        }

        public static void Configure(ServiceStackHost appHost, string defaultPackagesPath)
        {
            //https://githubengineering.com/crypto-removal-notice/
            ServicePointManager.Expect100Continue = true;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            JsConfig.MaxDepth = 10;
            JsConfig.EmitCamelCaseNames = true;
            appHost.Config.AddRedirectParamsToQueryString = true;
            appHost.Config.DebugMode = false;

            appHost.Plugins.Add(new TemplatePagesFeature());

            appHost.Plugins.Add(new ServerEventsFeature
            {
                ValidateUserAddress = false,
                OnCreated = (sub, req) =>
                {
                    sub.ConnectArgs["GistlynVersion"] = Assembly.GetExecutingAssembly().GetName().Version.ToString();
                    sub.ConnectArgs["ServiceStackVersion"] = Env.ServiceStackVersion.ToString(CultureInfo.InvariantCulture);
                }
            });

            appHost.Plugins.Add(new CorsFeature());

            appHost.Container.Register(new AppData(
                appHost.AppSettings.Get("NugetPackagesDirectory", defaultPackagesPath))
            {
                IllegalTokens = (appHost.AppSettings.GetString("IllegalTokens") ?? "Exit,DllImport,IntPtr,unsafe,SetEnvironmentVariable").FromJsv<string[]>()
            });

            appHost.Container.Register<IDataContext>(appHost.Container.Resolve<AppData>());

            appHost.Plugins.Add(new AuthFeature(() => new AuthUserSession(),
                new IAuthProvider[] {
                    new GithubAuthProvider(appHost.AppSettings),
                    new JwtAuthProvider(appHost.AppSettings) //Use JWT so sessions survive across AppDomain restarts, redeployments, etc
                    {
                        CreatePayloadFilter = (payload, session) =>
                        {
                            var githubAuth = session.ProviderOAuthAccess.Safe().FirstOrDefault(x => x.Provider == "github");
                            payload["ats"] = githubAuth?.AccessTokenSecret;
                        },

                        PopulateSessionFilter = (session, obj, req) =>
                        {
                            session.ProviderOAuthAccess = new List<IAuthTokens>
                            {
                                new AuthTokens { Provider = "github", AccessTokenSecret = obj["ats"] }
                            };
                        }
                    },
                }));

            //AppDomain.CurrentDomain.AssemblyResolve += (sender, args) =>
            //{
            //    Console.WriteLine(args);

            //    return null;
            //};
        }
    }
}
