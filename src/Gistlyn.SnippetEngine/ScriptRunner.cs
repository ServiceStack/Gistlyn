// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Gistlyn.ServiceModel.Types;
using Microsoft.CodeAnalysis.CSharp.Scripting;
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
            else
            {
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

        private bool IsObjectBrowseable(object obj)
        {
            if (obj == null)
                return false;

            var type = obj.GetType();

            return type.IsClass && type != typeof(string);
        }

        public object GetVariableValue(string varName, out Type type)
        {
            if (string.IsNullOrEmpty(varName))
                throw new ArgumentException("varName");

            var parts = varName.Split('.');

            type = null;
            var var = state.Result.Variables.FirstOrDefault(v => v.Name == parts[0]);

            if (var == null)
                return null;

            var value = var.Value;
            if (parts.Length == 1)
            {
                type = var.Type;
                return value;
            }

            for (var i = 0; i < parts.Length; i++)
            {
                var part = parts[i];
                var firstIdx = part.IndexOf('[');
                var lastIdx = part.LastIndexOf(']');
                var isIndexExpression = firstIdx != -1 && lastIdx != -1 && firstIdx < lastIdx;
                if (isIndexExpression)
                {
                    int index;
                    if (!int.TryParse(part.Substring(firstIdx, lastIdx), out index))
                        return null;

                    var t = value.GetType();
                    var indexer = t.GetProperties().FirstOrDefault(p => p.GetIndexParameters().Length > 0);
                    if (indexer != null)
                    {
                        value = indexer.GetValue(value, new object[] { index });
                    }
                }
                else if (firstIdx == -1 && lastIdx == -1)
                {
                    if (i > 0)
                    {
                        var t = value.GetType();
                        var prop = t.GetProperty(part);

                        if (prop == null)
                            return null;

                        value = prop.GetValue(value);
                    }
                }
                else
                {
                    return null;
                }
            }

            if (value != null)
                type = value.GetType();

            return value;
        }

        public List<VariableInfo> GetVariables()
        {
            if (GetScriptStatus() == ScriptStatus.Completed)
            {
                return state.Result.Variables.Select(x => new VariableInfo
                {
                    Name = x.Name,
                    Value = x.Value != null ? x.Value.ToString() : null,
                    Type = x.Type.ToString(),
                    IsBrowseable = IsObjectBrowseable(x.Value),
                    CanInspect = true,
                }).ToList();
            }
            return new List<VariableInfo>();
        }

        public ScriptStateVariables GetVariables(string parentVariable)
        {
            var variables = new ScriptStateVariables
            {
                Status = GetScriptStatus(),
                ParentVariable = new VariableInfo { Name = parentVariable },
                Variables = new List<VariableInfo>()
            };

            if (variables.Status == ScriptStatus.Completed)
            {
                if (!string.IsNullOrEmpty(parentVariable))
                {
                    Type varType;
                    object var = GetVariableValue(parentVariable, out varType);

                    variables.ParentVariable.Type = var?.GetType().ToString();
                    variables.ParentVariable.Value = var?.ToString();

                    var varProps = var?.GetType().GetProperties(BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public) ?? new PropertyInfo[] { };
                    var typeProps = varType != null
                        ? varType.GetProperties(BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public)
                        : new PropertyInfo[] { };

                    var typePropNames = typeProps.Select(x => x.Name).ToArray();

                    var curValEnumerable = var as IEnumerable;
                    if (curValEnumerable != null)
                    {
                        var i = 0;
                        foreach (var val in curValEnumerable)
                        {
                            variables.Variables.Add(new VariableInfo
                            {
                                Name = $"[{i}]",
                                Value = val?.ToString(),
                                Type = val?.GetType().ToString() ?? "null",
                                IsBrowseable = IsObjectBrowseable(val),
                                CanInspect = true,
                            });

                            if (i++ >= 100)
                                break;
                        }
                    }

                    foreach (var prop in varProps)
                    {
                        if (prop.GetIndexParameters().Length > 0) //Is Index property
                            continue;

                        try
                        {
                            object val = prop.GetValue(var, null);
                            var info = new VariableInfo
                            {
                                Name = prop.Name.LastRightPart('.'),
                                Value = val?.ToString(),
                                Type = val?.GetType().ToString() ?? prop.PropertyType.ToString(),
                                IsBrowseable = IsObjectBrowseable(val),
                                CanInspect = prop.GetGetMethod() != null && typePropNames.Contains(prop.Name),
                            };
                            variables.Variables.Add(info);
                        }
                        catch (Exception ex)
                        {
                            variables.Variables.Add(new VariableInfo
                            {
                                Name = prop.Name.LastRightPart('.'),
                                Value = "Threw Exception whilst trying to access value",
                                Type = prop.PropertyType.ToString(),
                                IsBrowseable = false,
                                CanInspect = false,
                            });
                        }
                    }
                }
                else
                {
                    variables.Variables = GetVariables();
                }
            }

            return variables;
        }

        private void PrepareScript(string mainScript, List<string> scripts, List<string> references, out string script, out ScriptOptions opt)
        {
            var resolver = new GistSourceResolver(scripts);

            opt = ScriptOptions.Default.WithSourceResolver(resolver);
            if (references != null && references.Count > 0)
                opt = opt.WithReferences(references);

            var sb = new StringBuilder();

            foreach (var key in resolver.Scripts.Keys)
            {
                sb.AppendFormat("#load \"{0}\"\n\r", key);
            }

            sb.Append(mainScript);

            script = sb.ToString();
        }

        public ScriptExecutionResult ExecuteAsync(string mainScript, List<string> scripts, List<string> references, INotifier notifier, CancellationToken cancellationToken = default(CancellationToken))
        {
            string script;
            ScriptOptions opt;

            PrepareScript(mainScript, scripts, references, out script, out opt);

            return ExecuteAsync(script, opt, notifier, cancellationToken);
        }

        public ScriptExecutionResult ExecuteAsync(string script, ScriptOptions opt, INotifier notifier, CancellationToken cancellationToken = default(CancellationToken))
        {
            var result = new ScriptExecutionResult { Variables = new List<VariableInfo>(), Errors = new List<ErrorInfo>() };

            status = ScriptStatus.PrepareToRun;

            Task.Factory.StartNew(() =>
            {
                try
                {
                    state = CSharpScript.RunAsync<int>(script, opt, null, null, cancellationToken);
                    status = GetScriptStateStatus();
                    result.Status = status;
                    if (state.Exception != null && state.Exception.InnerExceptions.Count > 0)
                    {
                        result.Exception = state.Exception.InnerExceptions[0];
                    }

                    state.ContinueWith(t =>
                    {
                        result.Status = GetScriptStateStatus();
                        notifier.SendScriptExecutionResults(result);
                        return t;
                    }, cancellationToken);
                }
                catch (CompilationErrorException e)
                {
                    status = ScriptStatus.CompiledWithErrors;
                    result.Status = status;
                    foreach (var err in e.Diagnostics)
                        result.Errors.Add(new ErrorInfo {Info = err.ToString()});

                    notifier.SendScriptExecutionResults(result);
                }
                catch (Exception e)
                {
                    status = ScriptStatus.ThrowedException;
                    result.Exception = e;
                    notifier.SendScriptExecutionResults(result);
                }
            }, cancellationToken);

            result.Status = status;
            notifier.SendScriptExecutionResults(result);

            return result;
        }

        private async Task<ScriptExecutionResult> Execute(string script, ScriptOptions opt)
        {
            var result = new ScriptExecutionResult { Variables = new List<VariableInfo>(), Errors = new List<ErrorInfo>() };

            try
            {
                state = CSharpScript.RunAsync<int>(script, opt);
                var scriptState = await state;
                //var scriptState = state.Result;

                foreach (var variable in scriptState.Variables)
                    result.Variables.Add(new VariableInfo { Name = variable.Name, Value = variable.Value != null ? variable.Value.ToString() : null, Type = variable.Type.ToString() });
            }
            catch (CompilationErrorException e)
            {
                foreach (var err in e.Diagnostics)
                    result.Errors.Add(new ErrorInfo { Info = err.ToString() });
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

        public ScriptExecutionResult EvaluateExpression(string expr, bool includeJson = false)
        {
            var scriptResult = new ScriptExecutionResult
            {
                Variables = new List<VariableInfo>(),
                Errors = new List<ErrorInfo>(),
                Status = GetScriptStatus()
            };

            if (scriptResult.Status == ScriptStatus.Completed)
            {
                try
                {
                    var info = new VariableInfo { Name = string.Empty };

                    //Need to block on Async otherwise fails on ScriptExecutionResult is not marked [Serializable] when it is
                    var stateResult = state.Result.ContinueWithAsync(expr).Result;

                    if (stateResult.ReturnValue != null)
                    {
                        info.Type = stateResult.ReturnValue.GetType().ToString();
                        info.Value = stateResult.ReturnValue.ToString();

                        if (includeJson)
                        {
                            info.Json = ScriptUtils.ToJson(stateResult.ReturnValue);
                        }
                    }

                    scriptResult.Variables.Add(info);
                }
                catch (CompilationErrorException e)
                {
                    scriptResult.Status = ScriptStatus.CompiledWithErrors;
                    foreach (var err in e.Diagnostics)
                        scriptResult.Errors.Add(new ErrorInfo { Info = err.ToString() });
                }
                catch (Exception e)
                {
                    scriptResult.Status = ScriptStatus.ThrowedException;
                    scriptResult.Exception = e;
                }
            }

            return scriptResult;
        }
    }
}
