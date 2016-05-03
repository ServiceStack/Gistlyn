using System;
using Gistlyn.Common.Objects;
using Gistlyn.ServiceInterfaces.Auth;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public class ConsoleWriterProxy : MarshalByRefObject
    {
        IServerEvents serverEvents;
        UserSession session;

        public ConsoleWriterProxy(UserSession session, IServerEvents serverEvents)
        {
            this.session = session;
            this.serverEvents = serverEvents;
        }

        public void SendMessage(string message)
        {
            var consoleMessage = new ConsoleMessage { Message = message };
            serverEvents.NotifySession(session.GetSessionId(), consoleMessage, "@channels");
        }

    }
}

