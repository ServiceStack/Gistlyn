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
using ServiceStack;
using ServiceStack.Text;

namespace Gistlyn.SnippetEngine
{
    public class ScriptRunner
    {
        Task<ScriptState<int>> state;
        ScriptStatus status;

        private ScriptStatus GetScriptStateStatus()
        {
            if (state != null)
            {
                switch (state.Status)
                {
                    case TaskStatus.RanToCompletion:
                        status = ScriptStatus.Completed;
                        break;
                    case TaskStatus.Running:
                        status = ScriptStatus.Running;
                        break;
                    case TaskStatus.Faulted:
                        status = ScriptStatus.ThrowedException;
                        break;
                    case TaskStatus.Canceled:
                        status = ScriptStatus.Cancelled;
                        break;
                }
            }
            else {
                status = ScriptStatus.Unknown;
            }

            return status;
        }

        public ScriptStatus GetScriptStatus()
        {
            if (status == ScriptStatus.CompiledWithErrors || status == ScriptStatus.PrepareToRun)
                return status;

            return GetScriptStateStatus();
        }

        public ScriptVariableJson GetVariableJson(string name)
        {
            ScriptVariableJson json = new ScriptVariableJson()
            {
                Status = GetScriptStatus()
            };

            if (json.Status == ScriptStatus.Completed)
            {
                var variable = state.Result.Variables.FirstOrDefault(v => v.Name == name);
                JsConfig.MaxDepth = 10;
                json.Json = variable != null && variable.Value != null ? variable.ToJson() : String.Empty;
            }

            return json;
        }

        public ScriptStateVariables GetVariables(string parentVariable)
        {
            ScriptStateVariables variables = new ScriptStateVariables() 
            { 
                Status = GetScriptStatus(),
                ParentVariable = parentVariable,
                Variables = new List<VariableInfo>() 
            };

            if (variables.Status == ScriptStatus.Completed)
            {
                //TODO: if parent variable is not null search into it via reflection
                //if (!String.IsNullOrEmpty(parentVariable)) {}

                foreach (var variable in state.Result.Variables)
                    variables.Variables.Add(new VariableInfo() { 
                    Name = variable.Name, 
                    Value = variable.Value != null ?  variable.Value.ToString() : null,
                    Type = variable.Type.ToString() 
                });
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

            status = ScriptStatus.Unknown;

            //new Thread(() =>
            ThreadPool.QueueUserWorkItem(_ =>
            {
                try
                {
                    status = ScriptStatus.PrepareToRun;
                    state = CSharpScript.RunAsync<int>(script, opt);
                    status = GetScriptStateStatus();
                }
                catch (CompilationErrorException e)
                {
                    status = ScriptStatus.CompiledWithErrors;
                    foreach (var err in e.Diagnostics)
                        result.Errors.Add(new ErrorInfo() { Info = err.ToString() });
                    //TODO: notify about error
                }
                catch (Exception e)
                {
                    status = ScriptStatus.ThrowedException;
                    result.Exception = e;
                    //TODO: notify about exception
                }
            });//.Start();

            result.Status = status;

            return result;
        }

        private async Task<ScriptExecutionResult> Execute(string script, ScriptOptions opt)
        {
            ScriptExecutionResult result = new ScriptExecutionResult() { Variables = new List<VariableInfo>(), Errors = new List<ErrorInfo>() };

            try
            {
                var state = await CSharpScript.RunAsync<int>(script, opt);

                foreach (var variable in state.Variables)
                    result.Variables.Add(new VariableInfo() { Name = variable.Name, Value = variable.Value != null ? variable.Value.ToString() : null, Type = variable.Type.ToString() });
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
