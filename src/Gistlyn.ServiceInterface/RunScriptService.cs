// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections.Generic;
using System.Linq;
using ServiceStack;
using Gistlyn.ServiceModel;
using System.IO;
using System.Net;
using System.Reflection;
using System.Security.Cryptography;
using System.Security.Policy;
using System.Text;
using System.Xml.Serialization;
using Gistlyn.ServiceModel.Types;
using ServiceStack.Logging;
using ServiceStack.Web;

namespace Gistlyn.ServiceInterface
{
    public partial class RunScriptService : Service
    {
        public static ILog Log = LogManager.GetLogger(typeof(RunScriptService));

        public AppData AppData { get; set; }

        public IDataContext DataContext { get; set; }

        public IServerEvents ServerEvents { get; set; }

        public object Any(RunScript request)
        {
            if (request.ScriptId == null)
                throw new ArgumentException("ScriptId");

            AppData.AssertNoIllegalTokens(request.MainSource);
            AppData.AssertNoIllegalTokens(request.Sources.ToArray());

            var result = new ScriptExecutionResult();

            var existingUserScripts = GetExistingActiveUserScripts();

            var runnerInfo = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            //stop script if run
            if (runnerInfo?.ScriptDomain != null)
            {
                var scriptStatus = runnerInfo.DomainWrapper.GetScriptStatus();

                if (request.ForceRun || scriptStatus != ScriptStatus.PrepareToRun && scriptStatus != ScriptStatus.Running)
                {
                    Cancel(runnerInfo);
                }
                else
                {
                    result.Status = ScriptStatus.AnotherScriptExecuting;
                    return new RunScriptResponse
                    {
                        Result = result
                    };
                }
            }

            var addedReferences = AddReferencesFromPackages(request.References, request.PackagesConfig, out var normalizedReferences);

            var evidence = new Evidence(AppDomain.CurrentDomain.Evidence);
            var binPath = VirtualFiles.RootDirectory.RealPath.Contains("\\bin\\")
                ? VirtualFiles.RootDirectory.RealPath                              //Winforms
                : Path.Combine(VirtualFiles.RootDirectory.RealPath, "bin");        //ASP.NET

            var setup = new AppDomainSetup
            {
                PrivateBinPath = binPath,
                ApplicationBase = VirtualFiles.RootDirectory.RealPath
            };

            var domain = AppDomain.CreateDomain(Guid.NewGuid().ToString(), evidence, setup);
            domain.AssemblyResolve += new AssemblyResolverSerializable { ResolvePath = binPath }.Resolve;

            var asm = typeof(DomainWrapper).Assembly.FullName;
            var type = typeof(DomainWrapper).FullName;

            var wrapper = (DomainWrapper)domain.CreateInstanceAndUnwrap(asm, type);
            //var wrapper = (DomainWrapper)domain.CreateInstanceFromAndUnwrap(asm, type);
            wrapper.ScriptId = request.ScriptId;
            var writerProxy = new NotifierProxy(ServerEvents, request.ScriptId);

            result = wrapper.RunAsync(request.MainSource, request.Sources, addedReferences.Select(r => r.Path).ToList(), writerProxy);

            LocalCache.SetScriptRunnerInfo(request.ScriptId, new ScriptRunnerInfo
            {
                ScriptId = request.ScriptId,
                SessionId = base.Request.GetPermanentSessionId(),
                CreatedDate = DateTime.UtcNow,
                ScriptDomain = domain,
                DomainWrapper = wrapper,
            });

            var unloadOldUserScripts = existingUserScripts
                .Where(x => x.ScriptId != request.ScriptId && DateTime.UtcNow - x.CreatedDate > TimeSpan.FromMinutes(1));

            var scriptsRemoved = UnloadExistingScripts(unloadOldUserScripts);

            return new RunScriptResponse
            {
                Result = result,
                References = normalizedReferences,
                ScriptsRemoved = scriptsRemoved,
            };
        }


        // System.Collections.Immutable dll hell, everything references NuGet 1.4.0 (.NET 1.2.2) but Roslyn still wantsfor NuGet 1.3.1 (.NET 1.2.1) at runtime
        // Assembly redirect bindings don't work.
        [Serializable]
        public class AssemblyResolverSerializable
        {
            public string ResolvePath { get; set; }

            public Assembly Resolve(object sender, ResolveEventArgs args)
            {
                var dllName = args.Name.LeftPart(',');
                var dllPath = Path.Combine(ResolvePath, dllName + ".dll");
                if (File.Exists(dllPath))
                {
                    var dll = Assembly.LoadFile(dllPath);
                    return dll;
                }

                return null;
            }
        }

        public object Any(GetScriptVariables request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner?.DomainWrapper;

            var variables = wrapper != null
                ? wrapper.GetVariables(request.VariableName)
                : new ScriptStateVariables { Status = ScriptStatus.Unknown };

            return variables;
        }

        public object Any(EvaluateExpression request)
        {
            var wrapper = GetDomainWrapper(request);
            return new EvaluateExpressionResponse
            {
                Result = wrapper.EvaluateExpression(request.Expression, request.IncludeJson)
            };
        }

        public object Any(CancelScript request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);
            var result = new ScriptExecutionResult
            {
                Status = Cancel(runner)
                    ? ScriptStatus.Cancelled
                    : ScriptStatus.Unknown
            };

            ////cancellation token does not work in mono
            ////leave this alternative way when cancellation token will be implemented
            //if (sess.DomainWrapper != null && sess.DomainWrapper.GistHash == null)
            //{
            //    sess.DomainWrapper.Cancel();
            //    result.Status = sess.DomainWrapper.GetScriptStatus();
            //}

            return new CancelScriptResponse
            {
                Result = result
            };
        }


        private DomainWrapper GetDomainWrapper(EvaluateExpression request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);
            var wrapper = runner?.DomainWrapper;
            if (wrapper == null)
                throw HttpError.NotFound("Script no longer exists on server");
            return wrapper;
        }

        private bool Cancel(ScriptRunnerInfo runner)
        {
            if (runner?.ScriptDomain != null)
            {
                runner.DomainWrapper.Cancel();
                var domain = runner.ScriptDomain;
                runner.ScriptDomain = null;
                LocalCache.RemoveScriptRunnerInfo(runner.ScriptId);
                AppDomain.Unload(domain);
                return true;
            }
            return false;
        }

        private List<AssemblyReference> AddReferencesFromPackages(List<AssemblyReference> references, string packages, out List<AssemblyReference> normalizedReferences)
        {
            try
            {
                var tmpReferences = new List<AssemblyReference>();

                if (references != null)
                    tmpReferences.AddRange(references);

                if (!string.IsNullOrEmpty(packages))
                {
                    PackageCollection tmpPackages = null;
                    var serializer = new XmlSerializer(typeof(PackageCollection));
                    var arr = packages.ToAsciiBytes();

                    using (var ms = new MemoryStream(arr))
                    {
                        tmpPackages = (PackageCollection)serializer.Deserialize(ms);
                    }

                    foreach (var package in tmpPackages.Packages)
                    {
                        //install it
                        tmpReferences.AddRange(NugetUtils.RestorePackage(DataContext, AppData.NugetPackagesDirectory, package.Id, package.Version));
                    }
                }

                //distinct by name
                tmpReferences = tmpReferences.GroupBy(a => a.Name).Select(g => g.First()).ToList();
                //normalizedReferences - references with original path
                normalizedReferences = tmpReferences
                    .Select(r => new AssemblyReference().PopulateWith(r))
                    .ToList();

                foreach (var reference in tmpReferences)
                {
                    if (!Path.IsPathRooted(reference.Path))
                    {
                        var rootPath = VirtualFiles.RootDirectory.RealPath;
                        reference.Path = Path.Combine(rootPath, AppData.NugetPackagesDirectory, reference.Path);
                    }
                }

                return tmpReferences;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private int UnloadExistingScripts(IEnumerable<ScriptRunnerInfo> runnerInfos)
        {
            var count = 0;
            foreach (var runnerInfo in runnerInfos)
            {
                try
                {
                    Cancel(runnerInfo);
                    var writerProxy = new NotifierProxy(ServerEvents, runnerInfo.ScriptId);
                    writerProxy.SendScriptExecutionResults(new ScriptExecutionResult { Status = ScriptStatus.Cancelled });
                    count++;
                }
                catch (Exception ex)
                {
                    Log.Error(ex);
                }
            }
            return count;
        }

        private List<ScriptRunnerInfo> GetExistingActiveUserScripts()
        {
            var to = new List<ScriptRunnerInfo>();
            var sessionId = Request.GetPermanentSessionId();
            if (!string.IsNullOrEmpty(sessionId))
            {
                foreach (var scriptKey in LocalCache.GetAllScriptKeys())
                {
                    var runner = LocalCache.GetScriptRunnerInfo(scriptKey);
                    if (runner != null && runner.SessionId == sessionId)
                    {
                        to.Add(runner);
                    }
                }
            }
            return to;
        }

        private string GetSourceCodeHash(RunEmbedScript request)
        {
            string hash;
            var code = (request.MainSource ?? string.Empty)
                + (request.Packages ?? string.Empty) + string.Concat(request.Sources);

            using (var md5 = MD5.Create())
            {
                var hashBytes = md5.ComputeHash(Encoding.Unicode.GetBytes(code));
                var sb = new StringBuilder();
                foreach (var b in hashBytes)
                {
                    sb.Append(b.ToString("x2"));
                }
                hash = sb.ToString();
            }

            return hash;
        }

        public object Any(FriendlyLinks request)
        {
            var slugsMap = base.LocalCache.Get<Dictionary<string, string>>("friendly-links");
            if (slugsMap == null || request.Reload)
            {
                var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                var gistUrl = GitHubServices.GithubApiBaseUrl.CombineWith("gists", "59e45270e41c1bd550b53436707eec21");
                var response = gistUrl.GetJsonFromUrl(req => req.UserAgent = "Gistlyn")
                    .FromJson<GithubGist>();

                if (!response.Files.TryGetValue("links.md", out var linksFile))
                    throw new Exception("links.md is missing");

                var md = linksFile.Content ?? "";
                foreach (var line in md.ReadLines())
                {
                    if (!line.TrimStart().StartsWith("-"))
                        continue;

                    var startNamePos = line.IndexOf('[');
                    var endNamePos = line.IndexOf(']');
                    var startLinkPos = line.IndexOf('(');
                    var endLinkPos = line.LastIndexOf(')');

                    if (startNamePos < 0 || endNamePos < 0 || startLinkPos < 0 || endLinkPos < 0)
                        continue;

                    var name = line.Substring(startNamePos + 1, endNamePos - startNamePos - 1).Trim();
                    var link = line.Substring(startLinkPos + 1, endLinkPos - startLinkPos - 1).Trim();

                    map[name] = link;
                }

                if (map.Count > 0 || slugsMap == null)
                {
                    slugsMap = map;
                    LocalCache.Set("friendly-links", slugsMap);
                }
            }

            if (string.IsNullOrEmpty(request.Name) || !slugsMap.TryGetValue(request.Name, out var url))
            {
                Response.StatusCode = (int) HttpStatusCode.NotFound;
                Response.StatusDescription = request.Name + " does not exist";
                Response.EndRequest();
                return null;
            }

            var absoluteUrl = base.Request.ResolveAbsoluteUrl("~/" + url);
            return HttpResult.Redirect(absoluteUrl);
        }

        public object Any(Proxy request)
        {
            if (string.IsNullOrEmpty(request.Url))
                throw new ArgumentNullException("Url");

            var hasRequestBody = HttpUtils.HasRequestBody(base.Request.Verb);
            try
            {
                var bytes = request.Url.SendBytesToUrl(
                method: base.Request.Verb,
                requestBody: hasRequestBody ? request.RequestStream.ReadFully() : null,
                contentType: hasRequestBody ? base.Request.ContentType : null,
                accept: ((IHttpRequest)base.Request).Accept,
                requestFilter: req => req.UserAgent = "Gistlyn",
                responseFilter: res => base.Request.ResponseContentType = res.ContentType);

                return bytes;
            }
            catch (WebException webEx)
            {
                var errorResponse = (HttpWebResponse)webEx.Response;
                base.Response.StatusCode = (int)errorResponse.StatusCode;
                base.Response.StatusDescription = errorResponse.StatusDescription;
                var bytes = errorResponse.GetResponseStream().ReadFully();
                return bytes;
            }
        }
    }

    [FallbackRoute("/{Name}", Matches = "AcceptsHtml")]
    public class FriendlyLinks
    {
        public string Name { get; set; }
        public bool Reload { get; set; }
    }

    [Route("/proxy")]
    public class Proxy : IRequiresRequestStream, IReturn<string>
    {
        public string Url { get; set; }
        public Stream RequestStream { get; set; }
    }
}
