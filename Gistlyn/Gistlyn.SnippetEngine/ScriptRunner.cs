using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Gistlyn.Common.Objects;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Scripting;

namespace Gistlyn.SnippetEngine
{
    public class ScriptRunner
    {
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
            GistSourceResolver resolver = new GistSourceResolver(scripts);

            ScriptOptions opt = ScriptOptions.Default.WithSourceResolver(resolver);
            if (references != null && references.Count >0)
                opt = opt.WithReferences(references);

            StringBuilder builder = new StringBuilder();

            foreach (var key in resolver.Scripts.Keys)
            {
                builder.AppendFormat("#load \"{0}\"\n\r", key);
            }

            builder.Append(mainScript);

            return Execute(builder.ToString(), opt);
        }
    }
}
