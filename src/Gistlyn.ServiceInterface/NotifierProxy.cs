using System;
using Gistlyn.ServiceModel.Types;
using Gistlyn.SnippetEngine;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public class NotifierProxy : MarshalByRefObject, INotifier
    {
        readonly IServerEvents serverEvents;
        readonly string subscriptionId;
        const string channel = "gist";

        public NotifierProxy(IServerEvents serverEvents, string subscriptionId)
        {
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
            serverEvents.NotifySubscription(subscriptionId, consoleMessage, channel);
        }

        public void SendScriptExecutionResults(ScriptExecutionResult result)
        {
            serverEvents.NotifySubscription(subscriptionId, result, channel);
        }
    }
}

