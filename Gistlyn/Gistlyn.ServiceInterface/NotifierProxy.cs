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
        string gistHash;

        public NotifierProxy(UserSession session, IServerEvents serverEvents, string gistHash)
        {
            this.session = session;
            this.sessionId = session.GetSessionId();
            this.serverEvents = serverEvents;
            this.gistHash = gistHash;
        }

        public override object InitializeLifetimeService()
        {
            return null;
        }

        public void SendConsoleMessage(string message)
        {
            var consoleMessage = new ConsoleMessage { Message = message };
            serverEvents.NotifySession(sessionId, consoleMessage, gistHash);
        }

        public void SendScriptExecutionResults(ScriptExecutionResult result)
        {
            serverEvents.NotifySession(sessionId, result, gistHash);
        }

    }
}

