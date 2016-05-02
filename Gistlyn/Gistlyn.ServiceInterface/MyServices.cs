using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ServiceStack;
using Gistlyn.ServiceModel;
using Gistlyn.ServiceInterfaces.Auth;

namespace Gistlyn.ServiceInterface
{
    public class MyServices : Service
    {
        public UserSession Session { get; set; }

        public IServerEvents ServerEvents { get; set; }

        public object Any(Hello request)
        {
            var response = new HelloResponse { Result = "Hello, {0}!".Fmt(request.Name) };

            try
            {
                // Session.SetGistHash("123");

                ServerEvents.NotifySession(Session.GetSessionId(), response, "@channels");
                ServerEvents.NotifyUserId(request.Name, response, "@channels");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }


            return response;

        }
    }
}