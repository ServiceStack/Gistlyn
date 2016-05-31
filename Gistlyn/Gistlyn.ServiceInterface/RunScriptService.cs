using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ServiceStack;
using Gistlyn.ServiceModel;
using Gistlyn.SnippetEngine;
using Gistlyn.Common.Objects;
using ServiceStack.Text;
using System.IO;
using XmlSerializer = System.Xml.Serialization.XmlSerializer;
using Gistlyn.Common.Interfaces;
using Gistlyn.ServiceInterfaces.Auth;
using System.Security.Policy;
using System.Security.Cryptography;
using System.Threading;

namespace Gistlyn.ServiceInterface
{
    public class RunScriptService : Service
    {
        public WebHostConfig Config { get; set; }

        public IDataContext DataContext { get; set; }

        public UserSession Session { get; set; }

        public IServerEvents ServerEvents { get; set; }

        public MemoizedResultsContainer MemoizedResults { get; set; }

        public object Any(GetScriptVariableJson request)
        {
            ScriptVariableJson variable;

            var runner = Session.GetScriptRunnerInfo(request.GistHash);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            variable = wrapper != null
                ? wrapper.GetVariableJson(request.VariableName)
                : new ScriptVariableJson() { Status = ScriptStatus.Unknown };

            return variable;
        }

        public object Any(EvaluateExpression request)
        {
            ScriptExecutionResult result;

            var runner = Session.GetScriptRunnerInfo(request.GistHash);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            result = wrapper != null
                ? wrapper.EvaluateExpression(request.Expression)
                : new ScriptExecutionResult() { Status = ScriptStatus.Unknown };

            return result;
        }

        public object Any(GetScriptVariables request)
        {
            ScriptStateVariables variables;

            var runner = Session.GetScriptRunnerInfo(request.GistHash);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            variables = wrapper != null
                ? wrapper.GetVariables(request.VariableName)
                : new ScriptStateVariables() { Status = ScriptStatus.Unknown };

            return variables;
        }

        public object Any(GetScriptStatus request)
        {
            var runner = Session.GetScriptRunnerInfo(request.GistHash);

            var wrapper = runner != null ? runner.DomainWrapper : null;

            return new ScriptStatusResponse()
            {
                Status = wrapper != null ? wrapper.GetScriptStatus() : ScriptStatus.Unknown
            };
        }

        public object Any(RunScript request)
        {
            ScriptRunner runner = new ScriptRunner();
            ScriptExecutionResult result = new ScriptExecutionResult();

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
            var result = new ScriptExecutionResult() { Status = ScriptStatus.Unknown };

            var runner = Session.GetScriptRunnerInfo(request.GistHash);

            if (runner != null && runner.ScriptDomain != null)
            {
                AppDomain domain = runner.ScriptDomain;
                runner.ScriptDomain = null;
                Session.SetScriptRunnerInfo(runner.GistHash, null, null);
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
            var result = new ScriptExecutionResult() { Status = ScriptStatus.Unknown };

            var runner = this.GetCacheClient().Get<ScriptRunnerInfo>(request.GistHash);
            this.GetCacheClient().Remove(request.GistHash);

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
            List<AssemblyReference> tmpReferences = new List<AssemblyReference>();

            if (references != null) 
                tmpReferences.AddRange(references);

            if (!String.IsNullOrEmpty(packages))
            {
                PackageCollection tmpPackages = null;

                XmlSerializer serializer = new XmlSerializer(typeof(PackageCollection));

                byte[] arr = packages.ToAsciiBytes();

                using (MemoryStream ms = new MemoryStream(arr))
                {
                    tmpPackages = (PackageCollection)serializer.Deserialize(ms);
                }

                foreach (NugetPackageInfo package in tmpPackages.Packages)
                {
                    //istall it
                    tmpReferences.AddRange(NugetHelper.RestorePackage(DataContext, Config.NugetPackagesDirectory, package.Id, package.Ver));
                }
            }

            //distinct by name
            tmpReferences = tmpReferences.GroupBy(a => a.Name).Select(g => g.First()).ToList();
            //normalizedReferences - references with original path
            normalizedReferences = tmpReferences
                .Select(r => new AssemblyReference().PopulateWith(r))
                .ToList();

            foreach (AssemblyReference reference in tmpReferences)
            {
                if (!Path.IsPathRooted(reference.Path))
                {
                    var rootPath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath;
                    reference.Path = Path.Combine(rootPath, Config.NugetPackagesDirectory, reference.Path);
                }
            }

            return tmpReferences;
        }

        public object Any(RunMultipleScripts request)
        {
            if (request.GistHash == null)
                throw new ArgumentException("GistHash");

            ScriptExecutionResult result = new ScriptExecutionResult();

            var runnerInfo = Session.GetScriptRunnerInfo(request.GistHash);
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
            List<AssemblyReference> addedReferences = AddReferencesFromPackages(request.References, request.Packages, out normalizedReferences);

            Evidence evidence = new Evidence(AppDomain.CurrentDomain.Evidence);
            AppDomainSetup setup = new AppDomainSetup();
            setup.PrivateBinPath = Path.Combine(System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath, "bin");
            setup.ApplicationBase = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath;

            AppDomain domain = AppDomain.CreateDomain(Guid.NewGuid().ToString(), evidence, setup);

            var asm = typeof(DomainWrapper).Assembly.FullName;
            var type = typeof(DomainWrapper).FullName;

            var wrapper = (DomainWrapper)domain.CreateInstanceAndUnwrap(asm, type);
            wrapper.GistHash = request.GistHash;
            //var wrapper = new DomainWrapper();
            var writerProxy = new NotifierProxy(Session, ServerEvents, request.GistHash);

            result = wrapper.RunAsync(request.MainCode, request.Scripts, addedReferences.Select(r => r.Path).ToList(), writerProxy);

            Session.SetScriptRunnerInfo(request.GistHash, domain, wrapper);

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
            string code = (request.MainCode ?? String.Empty)
                + (request.Packages ?? String.Empty) + String.Concat(request.Scripts);
            
            using (MD5 md5 = MD5.Create())
            {
                byte[] retVal = md5.ComputeHash(Encoding.Unicode.GetBytes(code));
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < retVal.Length; i++)
                {
                    sb.Append(retVal[i].ToString("x2"));
                }
                hash = sb.ToString();
            }

            return hash;
        }

        public object Any(RunJsIncludedScripts request)
        {
            if (request.GistHash == null)
                throw new ArgumentException("GistHash");

            JsIncludedScriptExecutionResult result = new JsIncludedScriptExecutionResult();
            string codeHash = GetSourceCodeHash(request);


            if (!request.NoCache)
            {
                MemoizedResult mr = MemoizedResults.Get(codeHash);
                if (mr != null)
                {
                    result = mr.Result;
                    return new RunJsIncludedScriptsResponse() { Result = result };
                }
            }

            List<AssemblyReference> normalizedReferences;
            List<AssemblyReference> addedReferences = AddReferencesFromPackages(request.References, request.Packages, out normalizedReferences);

            //Create domain and run script
            Evidence evidence = new Evidence(AppDomain.CurrentDomain.Evidence);
            AppDomainSetup setup = new AppDomainSetup();
            setup.PrivateBinPath = Path.Combine(System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath, "bin");
            setup.ApplicationBase = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath;

            AppDomain domain = AppDomain.CreateDomain(Guid.NewGuid().ToString(), evidence, setup);

            var asm = typeof(DomainWrapper).Assembly.FullName;
            var type = typeof(DomainWrapper).FullName;

            var wrapper = (DomainWrapper)domain.CreateInstanceAndUnwrap(asm, type);
            wrapper.GistHash = request.GistHash;
            //var wrapper = new DomainWrapper();
            var writerProxy = new NotifierProxy(Session, ServerEvents, request.GistHash);

            ScriptRunnerInfo info = new ScriptRunnerInfo() { GistHash = request.ScriptId, ScriptDomain = domain, DomainWrapper = wrapper };

            this.GetCacheClient().Set<ScriptRunnerInfo>(request.ScriptId, info);

            ManualResetEvent lockEvt = new ManualResetEvent(false);

            ThreadPool.QueueUserWorkItem(_ =>
            {
                try
                {
                    ScriptExecutionResult sr = wrapper.Run(request.MainCode, request.Scripts, addedReferences.Select(r => r.Path).ToList(), writerProxy);

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

            MemoizedResults.AddOrUpdate(new MemoizedResult() { CodeHash = codeHash, Result = result });

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
