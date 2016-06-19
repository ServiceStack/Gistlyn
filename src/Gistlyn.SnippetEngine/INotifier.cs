using Gistlyn.ServiceModel.Types;

namespace Gistlyn.SnippetEngine
{
    public interface INotifier
    {
        void SendConsoleMessage(string message);
        void SendScriptExecutionResults(ScriptExecutionResult result);
    }
}

