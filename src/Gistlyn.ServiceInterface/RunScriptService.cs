// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections.Generic;
using System.Linq;
using ServiceStack;
using Gistlyn.ServiceModel;
using System.IO;
using System.Security.Cryptography;
using System.Security.Policy;
using System.Text;
using System.Xml.Serialization;
using Gistlyn.ServiceModel.Types;
using ServiceStack.Logging;

namespace Gistlyn.ServiceInterface
{
    public partial class RunScriptService : Service
    {
        public static ILog Log = LogManager.GetLogger(typeof(RunScriptService));

        public AppData AppData { get; set; }

        public IDataContext DataContext { get; set; }

        public IServerEvents ServerEvents { get; set; }

        public object Any(Hello request)
        {
            return new HelloResponse { Result = "Hello, {0}!".Fmt(request.Name) };
        }

        public object Any(RunScript request)
        {
            if (request.ScriptId == null)
                throw new ArgumentException("ScriptId");

            var result = new ScriptExecutionResult();

            var existingUserScripts = GetExistingActiveUserScripts();

            var runnerInfo = LocalCache.GetScriptRunnerInfo(request.ScriptId);
            //stop script if run
            if (runnerInfo != null && runnerInfo.ScriptDomain != null)
            {
                var scriptStatus = runnerInfo.DomainWrapper.GetScriptStatus();

                if (request.ForceRun || (scriptStatus != ScriptStatus.PrepareToRun && scriptStatus != ScriptStatus.Running))
                {
                    AppDomain.Unload(runnerInfo.ScriptDomain);
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

            List<AssemblyReference> normalizedReferences;
            var addedReferences = AddReferencesFromPackages(request.References, request.PackagesConfig, out normalizedReferences);

            var evidence = new Evidence(AppDomain.CurrentDomain.Evidence);
            var setup = new AppDomainSetup
            {
                PrivateBinPath = Path.Combine(VirtualFiles.RootDirectory.RealPath, "bin"),
                ApplicationBase = VirtualFiles.RootDirectory.RealPath
            };

            var domain = AppDomain.CreateDomain(Guid.NewGuid().ToString(), evidence, setup);

            var asm = typeof(DomainWrapper).Assembly.FullName;
            var type = typeof(DomainWrapper).FullName;

            var wrapper = (DomainWrapper)domain.CreateInstanceAndUnwrap(asm, type);
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

        public object Any(GetScriptVariables request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

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
            var wrapper = runner != null ? runner.DomainWrapper : null;
            if (wrapper == null)
                throw HttpError.NotFound("Script no longer exists on server");
            return wrapper;
        }

        private bool Cancel(ScriptRunnerInfo runner)
        {
            if (runner != null && runner.ScriptDomain != null)
            {
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
    }
}
