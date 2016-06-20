using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Gistlyn.ServiceModel.Types;
using Gistlyn.SnippetEngine;

namespace Gistlyn.ServiceInterface
{
    public class DomainWrapper : MarshalByRefObject
    {
        readonly ScriptRunner runner = new ScriptRunner();
        string mainScript;
        List<string> scripts;
        List<string> references;
        CancellationTokenSource tokenSource;

        public string ScriptId { get; set; }

        public string MainScript { get { return mainScript; } }

        public List<string> Scripts { get { return scripts; } }

        public List<string> References { get { return references; } }

        public override object InitializeLifetimeService()
        {
            return null;
        }

        public void Cancel()
        {
            if (tokenSource != null)
            {
                tokenSource.Cancel(true);
            }
        }

        public ScriptExecutionResult EvaluateExpression(string expr)
        {
            ScriptExecutionResult result = runner.EvaluateExpression(expr).Result;

            return result;
        }

        public ScriptStatus GetScriptStatus()
        {
            return runner.GetScriptStatus();
        }

        public ScriptVariableJson GetVariableJson(string name)
        {
            return runner.GetVariableJson(name);
        }

        public ScriptStateVariables GetVariables(string parentVariable)
        {
            return runner.GetVariables(parentVariable);
        }

        public ScriptExecutionResult Run(string mainScript, List<string> scripts, List<string> references, NotifierProxy writerProxy)
        {
            this.mainScript = mainScript;
            this.scripts = scripts;
            this.references = references;

            var result = new ScriptExecutionResult();

            var tmp = Console.Out;
            using (var writer = new ConsoleWriter(writerProxy))
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

        public ScriptExecutionResult RunAsync(string mainScript, List<string> scripts, List<string> references, NotifierProxy writerProxy)
        {
            this.mainScript = mainScript;
            this.scripts = scripts;
            this.references = references;

            var writer = new ConsoleWriter(writerProxy);
            Console.SetOut(writer);

            tokenSource = new CancellationTokenSource();
            var result = runner.ExecuteAsync(mainScript, scripts, references, writerProxy, tokenSource.Token);

            /*TextWriter tmp = Console.Out;
            task.ContinueWith((_) =>
            {
                Console.SetOut(tmp);
                writer.Close();
            });*/

            return result;
        }
    }
}

