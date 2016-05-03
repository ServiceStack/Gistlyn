using System;
using System.Collections.Generic;
using System.IO;
using Gistlyn.Common.Objects;
using Gistlyn.SnippetEngine;

namespace Gistlyn.ServiceInterface
{
    public class DomainWrapper : MarshalByRefObject
    {
        public ScriptExecutionResult Run(string mainScript, List<string> scripts, List<string> references, ConsoleWriterProxy writerProxy)
        {
            ScriptRunner runner = new ScriptRunner();
            ScriptExecutionResult result = new ScriptExecutionResult();

            TextWriter tmp = Console.Out;
            using (ConsoleWriter writer = new ConsoleWriter(writerProxy))
            {
                Console.SetOut(writer);

                try
                {
                    var task = runner.Execute(mainScript, scripts, references);
                    //Session.SetScriptTask(task);
                    result = task.Result;
                    //ServerEvents.NotifySession(Session.GetSessionId(), result);
                }
                catch (Exception e)
                {
                    result.Exception = e;
                }

                Console.SetOut(tmp);
            }

            return result;

        }

    }
}

