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

namespace Gistlyn.ServiceInterface
{
    public class RunScriptService : Service
    {
        public WebHostConfig Config { get; set; }

        public IDataContext DataContext { get; set; }

        public UserSession Session { get; set; }

        public IServerEvents ServerEvents { get; set; }

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


            request.References = request.References ?? new List<AssemblyReference>();

            if (!String.IsNullOrEmpty(request.Packages))
            {
                PackageCollection packages = null;

                XmlSerializer serializer = new XmlSerializer(typeof(PackageCollection));

                byte[] arr = request.Packages.ToAsciiBytes();

                using (MemoryStream ms = new MemoryStream(arr))
                {
                    packages = (PackageCollection)serializer.Deserialize(ms);
                }

                foreach (NugetPackageInfo package in packages.Packages)
                {
                    //istall it
                    request.References.AddRange(NugetHelper.RestorePackage(DataContext, Config.NugetPackagesDirectory, package.Id, package.Ver));
                }
            }

            //distinct by name
            request.References = request.References.GroupBy(a => a.Name).Select(g => g.First()).ToList();
            List<AssemblyReference> addedReferences = request.References
                                                             .Select(r => new AssemblyReference().PopulateWith(r))
                                                             .ToList();

            foreach (AssemblyReference reference in request.References)
            {
                if (!Path.IsPathRooted(reference.Path))
                {
                    var rootPath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath;
                    reference.Path = Path.Combine(rootPath, Config.NugetPackagesDirectory, reference.Path);
                }
            }

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

            result = wrapper.RunAsync(request.MainCode, request.Scripts, request.References.Select(r => r.Path).ToList(), writerProxy);

            Session.SetScriptRunnerInfo(request.GistHash, domain, wrapper);

            //Unload appdomain only in synchroneous version
            //AppDomain.Unload(domain);

            return new RunMultipleScriptResponse
            {
                Result = result,
                References = addedReferences,
            };

            /*
            using (MemoryStream ms = new MemoryStream())
            {
                TextWriter tmp = Console.Out;
                using (StreamWriter sw = new StreamWriter(ms))
                {
                    Console.SetOut(sw);

                    try
                    {
                        var task = runner.Execute(request.MainCode, request.Scripts, request.References.Select(r => r.Path).ToList());
                        Session.SetScriptTask(task);
                        result = task.Result;
                        ServerEvents.NotifySession(Session.GetSessionId(), result);
                    }
                    catch (Exception e)
                    {
                        result.Exception = e;
                    }

                    sw.Close();
                    Console.SetOut(tmp);

                    result.Console = System.Text.Encoding.UTF8.GetString(ms.ToArray());

                    return new RunMultipleScriptResponse
                    {
                        Result = result,
                        References = addedReferences,
                    };
                }
            }
            */
        }

    }
}
