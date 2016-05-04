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


        public object Any(GetScriptVariables request)
        {
            ScriptStateVariables variables;

            var session = Session.GetCustomSession();

            var wrapper = session.DomainWrapper;

            variables = wrapper != null
                ? wrapper.GetVariables(request.VariableName)
                : new ScriptStateVariables() { Status = ScriptStatus.Unknown };

            return variables;
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

        public object Any(RunMultipleScripts request)
        {
            ScriptRunner runner = new ScriptRunner();
            ScriptExecutionResult result = new ScriptExecutionResult();

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
            //var wrapper = new DomainWrapper();
            var writerProxy = new ConsoleWriterProxy(Session, ServerEvents);

            result = wrapper.RunAsync(request.MainCode, request.Scripts, request.References.Select(r => r.Path).ToList(), writerProxy);

            Session.SetScriptTask(domain, wrapper);

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
