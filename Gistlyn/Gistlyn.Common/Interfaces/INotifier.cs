using System;
using Gistlyn.Common.Objects;

namespace Gistlyn.Common.Interfaces
{
    public interface INotifier
    {
        void SendConsoleMessage(string message);
        void SendScriptExecutionResults(ScriptExecutionResult result);
    }
}

