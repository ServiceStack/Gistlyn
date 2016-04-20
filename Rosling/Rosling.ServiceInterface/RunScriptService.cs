using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ServiceStack;
using Rosling.ServiceModel;
using Rosling.SnippetEngine;
using Rosling.Common.Objects;

namespace Rosling.ServiceInterface
{
    public class RunScriptService : Service
    {
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
    }
}
