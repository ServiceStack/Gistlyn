using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Gistlyn.Common.Objects;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Scripting;

namespace Gistlyn.SnippetEngine
{
    public class ScriptRunner
    {
        public Task<ScriptState<int>> state;

        public List<VariableInfo> GetVariables()
        {
            List<VariableInfo> variables = new List<VariableInfo>();

            //TODO: return state of the task
            if (state.IsCompleted)
            {
                foreach (var variable in state.Result.Variables)
                    variables.Add(new VariableInfo() { Name = variable.Name, Value = variable.Value.ToString(), Type = variable.Type.ToString() });
            }

            return variables;
        }

        private void PrepareScript(string mainScript, List<string> scripts, List<string> references, out string script, out ScriptOptions opt)
        {
            GistSourceResolver resolver = new GistSourceResolver(scripts);

            opt = ScriptOptions.Default.WithSourceResolver(resolver);
            if (references != null && references.Count > 0)
                opt = opt.WithReferences(references);

            StringBuilder builder = new StringBuilder();

            foreach (var key in resolver.Scripts.Keys)
            {
                builder.AppendFormat("#load \"{0}\"\n\r", key);
            }

            builder.Append(mainScript);

            script = builder.ToString();
        }

        public ScriptExecutionResult ExecuteAsync(string mainScript, List<string> scripts, List<string> references)
        {
            string script;
            ScriptOptions opt;

            PrepareScript(mainScript, scripts, references, out script, out opt);

            return ExecuteAsync(script, opt); 
        }

        public ScriptExecutionResult ExecuteAsync(string script, ScriptOptions opt)
        {
            ScriptExecutionResult result = new ScriptExecutionResult() { Variables = new List<VariableInfo>(), Errors = new List<ErrorInfo>() };

            //new Thread(() =>
            ThreadPool.QueueUserWorkItem(_ =>
            {
                try
                {
                    state = CSharpScript.RunAsync<int>(script, opt);
                }
                catch (CompilationErrorException e)
                {
                    foreach (var err in e.Diagnostics)
                        result.Errors.Add(new ErrorInfo() { Info = err.ToString() });
                }
                catch (Exception e)
                {
                    result.Exception = e;
                }
            });//.Start();

            return result;
        }

        private async Task<ScriptExecutionResult> Execute(string script, ScriptOptions opt)
        {
            ScriptExecutionResult result = new ScriptExecutionResult() { Variables = new List<VariableInfo>(), Errors = new List<ErrorInfo>() };

            try
            {
                var state = await CSharpScript.RunAsync<int>(script, opt);

                foreach (var variable in state.Variables)
                    result.Variables.Add(new VariableInfo() { Name = variable.Name, Value = variable.Value.ToString(), Type = variable.Type.ToString() });
            }
            catch (CompilationErrorException e)
            {
                foreach (var err in e.Diagnostics)
                    result.Errors.Add(new ErrorInfo() { Info = err.ToString() });
            }
            catch (Exception e)
            {
                result.Exception = e;
            }

            return result;
        }

        public Task<ScriptExecutionResult> Execute(string script)
        {
            return Execute(script, ScriptOptions.Default);
        }

        public Task<ScriptExecutionResult> Execute(string mainScript, List<string> scripts, List<string> references)
        {
            string script;
            ScriptOptions opt;

            PrepareScript(mainScript, scripts, references, out script, out opt);

            return Execute(script, opt);
        }
    }
}
