using System;
using Gistlyn.Common.Interfaces;
using Gistlyn.Common.Objects;
using Gistlyn.ServiceInterfaces.Auth;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public class NotifierProxy : MarshalByRefObject, INotifier
    {
        IServerEvents serverEvents;
        UserSession session;
        string sessionId;

        public NotifierProxy(UserSession session, IServerEvents serverEvents)
        {
            this.session = session;
            this.sessionId = session.GetSessionId();
            this.serverEvents = serverEvents;
        }

        public void SendConsoleMessage(string message)
        {
            var consoleMessage = new ConsoleMessage { Message = message };
            serverEvents.NotifySession(sessionId, consoleMessage, "@channels");
        }

        public void SendScriptExecutionResults(ScriptExecutionResult result)
        {
            serverEvents.NotifySession(sessionId, result, "@channels");
        }

    }
}

