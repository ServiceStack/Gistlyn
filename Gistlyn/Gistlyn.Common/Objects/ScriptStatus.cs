using System;
namespace Gistlyn.Common.Objects
{
    public enum ScriptStatus
    {
        Unknown = 0,
        PrepareToRun,
        Running,
        Completed,
        Cancelled,
        CompiledWithErrors,
        ThrowedException,
        AnotherScriptExecuting
    }
}

