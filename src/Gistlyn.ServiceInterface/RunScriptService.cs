using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack;
using Gistlyn.ServiceModel;
using Gistlyn.SnippetEngine;
using System.IO;
using Gistlyn.ServiceInterface.Auth;
using System.Security.Policy;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Gistlyn.ServiceModel.Types;
using ServiceStack.Logging;

namespace Gistlyn.ServiceInterface
{
    public class RunScriptService : Service
    {
        public static ILog Log = LogManager.GetLogger(typeof(RunScriptService));

        public AppData AppData { get; set; }

        public IDataContext DataContext { get; set; }

        public IServerEvents ServerEvents { get; set; }

        public object Any(Hello request)
        {
            return new HelloResponse { Result = "Hello, {0}!".Fmt(request.Name) };
        }

        public object Any(TestServerEvents request)
        {
            var response = new TestServerEventsResponse { Result = "Hello, {0}!".Fmt(request.Name) };

            try
            {
                ServerEvents.NotifySession(Request.GetSessionId(), response, "@channels");
                ServerEvents.NotifyUserId(request.Name, response, "@channels");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return response;
        }

        public object Any(GetScriptVariableJson request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            var variable = wrapper != null
                ? wrapper.GetVariableJson(request.VariableName)
                : new ScriptVariableJson { Status = ScriptStatus.Unknown };

            return variable;
        }

        public async Task<EvaluateExpressionResponse> Any(EvaluateExpression request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            var result = wrapper != null
                ? await wrapper.EvaluateExpression(request.Expression, request.IncludeJson)
                : new ScriptExecutionResult { Status = ScriptStatus.Unknown };

            return new EvaluateExpressionResponse { Result = result };
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

        public object Any(GetScriptStatus request)
        {
            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            return new ScriptStatusResponse
            {
                Status = wrapper != null ? wrapper.GetScriptStatus() : ScriptStatus.Unknown
            };
        }

        public object Any(EvaluateSource request)
        {
            var runner = new ScriptRunner();
            var result = new ScriptExecutionResult();

            try
            {
                result = runner.Execute(request.Code).Result;
            }
            catch (Exception e)
            {
                result.Exception = e;
            }

            return new EvaluateSourceResponse
            {
                Result = result
            };
        }

        public object Any(CancelScript request)
        {
            var result = new ScriptExecutionResult { Status = ScriptStatus.Unknown };

            var runner = LocalCache.GetScriptRunnerInfo(request.ScriptId);

            if (runner != null && runner.ScriptDomain != null)
            {
                AppDomain domain = runner.ScriptDomain;
                runner.ScriptDomain = null;
                LocalCache.RemoveScriptRunnerInfo(runner.ScriptId);
                AppDomain.Unload(domain);
                result.Status = ScriptStatus.Cancelled;
            }

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

        public object Any(CancelEmbedScript request)
        {
            var result = new ScriptExecutionResult { Status = ScriptStatus.Unknown };

            var runner = this.GetCacheClient().Get<ScriptRunnerInfo>(request.ScriptId);
            this.GetCacheClient().Remove(request.ScriptId);

            if (runner != null && runner.ScriptDomain != null)
            {
                AppDomain domain = runner.ScriptDomain;
                runner.ScriptDomain = null;
                AppDomain.Unload(domain);
                result.Status = ScriptStatus.Cancelled;
            }

            return new CancelEmbedScriptResponse
            {
                Result = result
            };
        }

        private List<AssemblyReference> AddReferencesFromPackages(List<AssemblyReference> references, string packages, out List<AssemblyReference> normalizedReferences)
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
                    //istall it
                    tmpReferences.AddRange(NugetHelper.RestorePackage(DataContext, AppData.NugetPackagesDirectory, package.Id, package.Version));
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
                    var rootPath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath;
                    reference.Path = Path.Combine(rootPath, AppData.NugetPackagesDirectory, reference.Path);
                }
            }

            return tmpReferences;
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
                PrivateBinPath = Path.Combine(System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath, "bin"),
                ApplicationBase = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath
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
                ScriptDomain = domain,
                DomainWrapper = wrapper,
            });

            var scriptsRemoved = UnloadExistingScripts(existingUserScripts.Where(x => x.ScriptId != request.ScriptId));

            return new RunScriptResponse
            {
                Result = result,
                References = normalizedReferences,
                ScriptsRemoved = scriptsRemoved,
            };
        }

        private int UnloadExistingScripts(IEnumerable<ScriptRunnerInfo> runnerInfos)
        {
            var count = 0;
            foreach (var runnerInfo in runnerInfos)
            {
                try
                {
                    AppDomain.Unload(runnerInfo.ScriptDomain);
                    LocalCache.RemoveScriptRunnerInfo(runnerInfo.ScriptId);
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

        public object Any(RunEmbedScript request)
        {
            if (request.GistHash == null)
                throw new ArgumentException("GistHash");

            var result = new EmbedScriptExecutionResult();
            var codeHash = GetSourceCodeHash(request);

            if (!request.NoCache)
            {
                var mr = AppData.GetMemoizedResult(codeHash);
                if (mr != null)
                {
                    result = mr.Result;
                    return new RunEmbedScriptResponse { Result = result };
                }
            }

            List<AssemblyReference> normalizedReferences;
            var addedReferences = AddReferencesFromPackages(request.References, request.Packages, out normalizedReferences);

            //Create domain and run script
            var evidence = new Evidence(AppDomain.CurrentDomain.Evidence);
            var setup = new AppDomainSetup
            {
                PrivateBinPath = Path.Combine(System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath, "bin"),
                ApplicationBase = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath
            };

            var domain = AppDomain.CreateDomain(Guid.NewGuid().ToString(), evidence, setup);

            var asm = typeof(DomainWrapper).Assembly.FullName;
            var type = typeof(DomainWrapper).FullName;

            var wrapper = (DomainWrapper)domain.CreateInstanceAndUnwrap(asm, type);
            wrapper.ScriptId = request.ScriptId;
            var writerProxy = new NotifierProxy(ServerEvents, request.ScriptId);

            var info = new ScriptRunnerInfo { ScriptId = request.ScriptId, ScriptDomain = domain, DomainWrapper = wrapper };

            Cache.Set(request.ScriptId, info);

            var lockEvt = new ManualResetEvent(false);

            ThreadPool.QueueUserWorkItem(_ =>
            {
                try
                {
                    var sr = wrapper.Run(request.MainSource, request.Sources, addedReferences.Select(r => r.Path).ToList(), writerProxy);

                    result.Exception = sr.Exception;
                    result.Errors = sr.Errors;

                    //get json of last variable
                    if (sr.Variables != null && sr.Variables.Count > 0)
                    {
                        result.LastVariableJson = wrapper.GetVariableJson(sr.Variables[sr.Variables.Count - 1].Name);
                    }
                }
                finally
                {
                    lockEvt.Set();
                }
            });

            lockEvt.WaitOne();

            AppData.SetMemoizedResult(new MemoizedResult { CodeHash = codeHash, Result = result });

            //Unload appdomain only in synchroneous version
            //AppDomain.Unload(domain);

            return new RunEmbedScriptResponse
            {
                Result = result,
                References = normalizedReferences
            };
        }
    }
}
