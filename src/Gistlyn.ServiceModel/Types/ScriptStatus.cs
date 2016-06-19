namespace Gistlyn.ServiceModel.Types
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

