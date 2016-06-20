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
        string subscriptionId;
        const string channel = "gist";

        public NotifierProxy(UserSession session, IServerEvents serverEvents, string subscriptionId)
        {
            this.session = session;
            this.serverEvents = serverEvents;
            this.subscriptionId = subscriptionId;
        }

        public override object InitializeLifetimeService()
        {
            return null;
        }

        public void SendConsoleMessage(string message)
        {
            var consoleMessage = new ConsoleMessage { Message = message };
            serverEvents.NotifySubscription(subscriptionId, consoleMessage, "gist");
        }

        public void SendScriptExecutionResults(ScriptExecutionResult result)
        {
            serverEvents.NotifySubscription(subscriptionId, result, "gist");
        }

    }
}

