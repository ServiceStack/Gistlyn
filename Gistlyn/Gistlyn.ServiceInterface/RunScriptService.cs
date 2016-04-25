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

namespace Gistlyn.ServiceInterface
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

        public object Any(RunMultipleScripts request)
        {
            ScriptRunner runner = new ScriptRunner();
            ScriptExecutionResult result = new ScriptExecutionResult();

            try
            {
                result = runner.Execute(request.MainCode, request.Scripts, request.References).Result;
            }
            catch (Exception e)
            {
                result.Exception = e;
            }

            return new RunScriptResponse
            {
                Result = result
            };
        }

    }
}
