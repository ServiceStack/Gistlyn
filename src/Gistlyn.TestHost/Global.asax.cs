using System;
using ServiceStack;

namespace Gistlyn.TestHost
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            new AppHost().Init();
        }

        protected void Application_End(object sender, EventArgs e)
        {
            HostContext.AppHost.Dispose();
        }
    }
}