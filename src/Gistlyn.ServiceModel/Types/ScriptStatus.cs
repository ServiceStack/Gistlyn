namespace Gistlyn.ServiceModel.Types
{
    public enum ScriptStatus
    {
        Unknown,
        PrepareToRun,
        Running,
        Completed,
        Cancelled,
        CompiledWithErrors,
        ThrowedException,
        AnotherScriptExecuting
    }
}

