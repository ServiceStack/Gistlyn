// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

#if ASPNET
using System;
using System.Collections.Generic;
using System.Linq;
using ServiceStack;
using Gistlyn.ServiceModel;
using System.IO;
using Gistlyn.ServiceInterface.Auth;
using System.Security.Policy;
using System.Text;
using System.Threading;
using Gistlyn.ServiceModel.Types;

namespace Gistlyn.ServiceInterface
{
    public partial class RunScriptService : Service
    {
        [AddHeader(ContentType = "text/javascript")]
        public object Any(GetEmbedScript request)
        {
            var scriptId = Guid.NewGuid().ToString().Replace("-", string.Empty);
            var url = string.Empty;
            int idx = Request.AbsoluteUri.IndexOf(Request.RawUrl, StringComparison.OrdinalIgnoreCase);

            if (idx > 0)
                url = Request.AbsoluteUri.Substring(0, idx);

            var htmlContent = VirtualFileSources.GetFile("templates/embed.html").ReadAllText();
            var scriptContent = VirtualFileSources.GetFile("templates/embed.init.js").ReadAllText();

            var sb = new StringBuilder();

            sb.AppendFormat(scriptContent, scriptId, request.Gist, request.NoCache.ToJson(), url);

            htmlContent = htmlContent.Replace("\r", string.Empty).Replace("\n", "\\\n").Replace("'", "''");
            htmlContent = string.Format(htmlContent, scriptId);

            sb.AppendFormat("document.write('{0}');\n", htmlContent);
            sb.AppendFormat("init_{0}();\n", scriptId);

            return sb.ToString();
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
                PrivateBinPath = Path.Combine(VirtualFiles.RootDirectory.RealPath, "bin"),
                ApplicationBase = VirtualFiles.RootDirectory.RealPath
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
                        result.LastVariableJson = wrapper.GetVariableValue(sr.Variables[sr.Variables.Count - 1].Name).ToJson();
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
#endif
