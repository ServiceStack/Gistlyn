// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections.Generic;
using System.Threading;
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

        public string MainScript => mainScript;

        public List<string> Scripts => scripts;

        public List<string> References => references;

        public override object InitializeLifetimeService()
        {
            return null;
        }

        public void Cancel()
        {
            tokenSource?.Cancel(true);
        }

        public ScriptExecutionResult EvaluateExpression(string expr, bool includeJson)
        {
            return runner.EvaluateExpression(expr, includeJson);
        }

        public ScriptStatus GetScriptStatus()
        {
            return runner.GetScriptStatus();
        }

        public object GetVariableValue(string varName)
        {
            return runner.GetVariableValue(varName, out _);
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

