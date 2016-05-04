using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Gistlyn.Common.Objects;
using Gistlyn.SnippetEngine;

namespace Gistlyn.ServiceInterface
{
    public class DomainWrapper : MarshalByRefObject
    {
        ScriptRunner runner = new ScriptRunner();

        public ScriptExecutionResult Run(string mainScript, List<string> scripts, List<string> references, ConsoleWriterProxy writerProxy)
        {
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

        public ScriptExecutionResult RunAsync(string mainScript, List<string> scripts, List<string> references, ConsoleWriterProxy writerProxy)
        {
            TextWriter tmp = Console.Out;
            ConsoleWriter writer = new ConsoleWriter(writerProxy);
            Console.SetOut(writer);

            ScriptExecutionResult result = runner.ExecuteAsync(mainScript, scripts, references);

            /*task.ContinueWith((_) =>
            {
                Console.SetOut(tmp);
                writer.Close();
            });*/

            return result;
        }
    }
}

