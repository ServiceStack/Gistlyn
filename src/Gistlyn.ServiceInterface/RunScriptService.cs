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
using System.Xml.Serialization;
using Gistlyn.ServiceModel.Types;

namespace Gistlyn.ServiceInterface
{
    public class RunScriptService : Service
    {
        public AppData AppData { get; set; }

        public IDataContext DataContext { get; set; }

        public UserSession Session { get; set; }

        public IServerEvents ServerEvents { get; set; }

        public object Any(TestServerEvents request)
        {
            var response = new TestServerEventsResponse { Result = "Hello, {0}!".Fmt(request.Name) };

            try
            {
                ServerEvents.NotifySession(Session.GetSessionId(), response, "@channels");
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
            var runner = Session.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            var variable = wrapper != null
                ? wrapper.GetVariableJson(request.VariableName)
                : new ScriptVariableJson { Status = ScriptStatus.Unknown };

            return variable;
        }

        public object Any(EvaluateExpression request)
        {
            ScriptExecutionResult result;

            var runner = Session.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            result = wrapper != null
                ? wrapper.EvaluateExpression(request.Expression)
                : new ScriptExecutionResult { Status = ScriptStatus.Unknown };

            return result;
        }

        public object Any(GetScriptVariables request)
        {
            ScriptStateVariables variables;

            var runner = Session.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            variables = wrapper != null
                ? wrapper.GetVariables(request.VariableName)
                : new ScriptStateVariables { Status = ScriptStatus.Unknown };

            return variables;
        }

        public object Any(GetScriptStatus request)
        {
            var runner = Session.GetScriptRunnerInfo(request.ScriptId);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            return new ScriptStatusResponse
            {
                Status = wrapper != null ? wrapper.GetScriptStatus() : ScriptStatus.Unknown
            };
        }

        public object Any(RunScript request)
        {
            var runner = new ScriptRunner();
            var result = new ScriptExecutionResult();

            try 
            {
                result = runner.Execute (request.Code).Result;
            } catch (Exception e)
            {
                result.Exception = e;
            }

            return new RunScriptResponse {
                Result = result
            };
        }

        public object Any(CancelScript request)
        {
            var result = new ScriptExecutionResult { Status = ScriptStatus.Unknown };

            var runner = Session.GetScriptRunnerInfo(request.ScriptId);

            if (runner != null && runner.ScriptDomain != null)
            {
                AppDomain domain = runner.ScriptDomain;
                runner.ScriptDomain = null;
                Session.SetScriptRunnerInfo(runner.ScriptId, null, null);
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

            return new CancelScriptResponse()
            {
                Result = result
            };
        }

        public object Any(CancelJsIncludedScript request)
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

            return new CancelJsIncludedScriptResponse()
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
                    tmpReferences.AddRange(NugetHelper.RestorePackage(DataContext, AppData.NugetPackagesDirectory, package.Id, package.Ver));
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

        public object Any(RunMultipleScripts request)
        {
            if (request.ScriptId == null)
                throw new ArgumentException("ScriptId");

            var result = new ScriptExecutionResult();

            var runnerInfo = Session.GetScriptRunnerInfo(request.ScriptId);
            //stop script if run
            if (runnerInfo != null && runnerInfo.ScriptDomain != null)
            {
                var scriptStatus = runnerInfo.DomainWrapper.GetScriptStatus();

                if (request.ForceRun ||  (scriptStatus != ScriptStatus.PrepareToRun && scriptStatus != ScriptStatus.Running))
                {
                    AppDomain.Unload(runnerInfo.ScriptDomain);
                }
                else 
                {
                    result.Status = ScriptStatus.AnotherScriptExecuting;
                    return new RunMultipleScriptResponse
                    {
                        Result = result
                    };
                }
            }


            List<AssemblyReference> normalizedReferences;
            var addedReferences = AddReferencesFromPackages(request.References, request.Packages, out normalizedReferences);

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
            //var wrapper = new DomainWrapper();
            var writerProxy = new NotifierProxy(Session, ServerEvents, request.ScriptId);

            result = wrapper.RunAsync(request.MainCode, request.Scripts, addedReferences.Select(r => r.Path).ToList(), writerProxy);

            Session.SetScriptRunnerInfo(request.ScriptId, domain, wrapper);

            //Unload appdomain only in synchroneous version
            //AppDomain.Unload(domain);

            return new RunMultipleScriptResponse
            {
                Result = result,
                References = normalizedReferences
            };
        }

        private string GetSourceCodeHash(RunJsIncludedScripts request)
        {
            string hash;
            var code = (request.MainCode ?? string.Empty)
                + (request.Packages ?? string.Empty) + string.Concat(request.Scripts);
            
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

        public object Any(RunJsIncludedScripts request)
        {
            if (request.GistHash == null)
                throw new ArgumentException("GistHash");

            var result = new JsIncludedScriptExecutionResult();
            var codeHash = GetSourceCodeHash(request);

            if (!request.NoCache)
            {
                var mr = AppData.GetMemoizedResult(codeHash);
                if (mr != null)
                {
                    result = mr.Result;
                    return new RunJsIncludedScriptsResponse { Result = result };
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
            //var wrapper = new DomainWrapper();
            var writerProxy = new NotifierProxy(Session, ServerEvents, request.ScriptId);

            var info = new ScriptRunnerInfo { ScriptId = request.ScriptId, ScriptDomain = domain, DomainWrapper = wrapper };

            Cache.Set(request.ScriptId, info);

            var lockEvt = new ManualResetEvent(false);

            ThreadPool.QueueUserWorkItem(_ =>
            {
                try
                {
                    var sr = wrapper.Run(request.MainCode, request.Scripts, addedReferences.Select(r => r.Path).ToList(), writerProxy);

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

            return new RunJsIncludedScriptsResponse
            {
                Result = result,
                References = normalizedReferences
            };
        }
    }
}
