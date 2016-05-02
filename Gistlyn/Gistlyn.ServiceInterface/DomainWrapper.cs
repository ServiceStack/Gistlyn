using System;
using System.Collections.Generic;
using System.IO;
using Gistlyn.Common.Objects;
using Gistlyn.SnippetEngine;

namespace Gistlyn.ServiceInterface
{
    public class DomainWrapper : MarshalByRefObject
    {
        public ScriptExecutionResult Run(string mainScript, List<string> scripts, List<string> references)
        {
            ScriptRunner runner = new ScriptRunner();
            ScriptExecutionResult result = new ScriptExecutionResult();

            using (MemoryStream ms = new MemoryStream())
            {
                TextWriter tmp = Console.Out;
                using (StreamWriter sw = new StreamWriter(ms))
                {
                    Console.SetOut(sw);

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

                    sw.Close();
                    Console.SetOut(tmp);

                    result.Console = System.Text.Encoding.UTF8.GetString(ms.ToArray());

                    return result;
                }
            }

        }

    }
}

