using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ServiceStack;
using Rosling.ServiceModel;
using Rosling.SnippetEngine;


namespace Rosling.ServiceInterface
{
    public class RunScriptService : Service
    {
        public object Any(RunScript request)
        {
            ScriptRunner runner = new ScriptRunner();

            var result = runner.Execute(request.Code).Result;
            

            return new RunScriptResponse {
                Result = result
            };
        }
    }
}
