using System;
using Gistlyn.ServiceInterface.Auth;
using Gistlyn.ServiceModel.Types;
using Gistlyn.SnippetEngine;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public class NotifierProxy : MarshalByRefObject, INotifier
    {
        IServerEvents serverEvents;
        UserSession session;
        string gistHash;
        const string channel = "gist";

        public NotifierProxy(UserSession session, IServerEvents serverEvents, string gistHash)
        {
            this.session = session;
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
            serverEvents.NotifySubscription(gistHash, consoleMessage, "gist");
        }

        public void SendScriptExecutionResults(ScriptExecutionResult result)
        {
            serverEvents.NotifySubscription(gistHash, result, "gist");
        }

    }
}

