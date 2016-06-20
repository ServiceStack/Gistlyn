using System;
using System.IO;
using Funq;
using Gistlyn.ServiceInterface;
using Gistlyn.ServiceInterface.Auth;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Caching;
using ServiceStack.Text;

namespace Gistlyn.TestHost
{
    public class AppHost : AppHostBase
    {
        /// <summary>
        /// Default constructor.
        /// Base constructor requires a name and assembly to locate web service classes. 
        /// </summary>
        public AppHost()
            : base("Gistlyn", typeof(RunScriptService).Assembly) {}

        /// <summary>
        /// Application specific configuration
        /// This method should initialize any IoC resources utilized by your web service classes.
        /// </summary>
        /// <param name="container"></param>
        public override void Configure(Container container)
        {
            JsConfig.EmitCamelCaseNames = true;

            Plugins.Add(new ServerEventsFeature
            {
                HeartbeatInterval = TimeSpan.FromSeconds(30),
                IdleTimeout = TimeSpan.FromSeconds(100),
                OnConnect = (sub, args) =>
                {
                    Console.WriteLine("OnConnect");
                },
                OnCreated = (sub, req) =>
                {
                    Console.WriteLine("OnCreated");
                },
                OnSubscribe = sub =>
                {
                    Console.WriteLine("OnSubscribe");
                },
                OnUnsubscribe = sub =>
                {
                    Console.WriteLine("OnUnsubscribe");
                }
            });

            //container.Register(new MemoizedResultsContainer());

            //session and authentication
            Plugins.Add(new SessionFeature());
            container.Register(c => new UserSession(c.Resolve<ICacheClient>()));

            //To limit access to scripts only from the known sites
            //this.Plugins.Add(new CorsFeature(allowedOrigins: "http://127.0.0.1:8080", allowCredentials: true));
            this.Plugins.Add(new CorsFeature());

            container.Register(new AppData(
                AppSettings.Get("NugetPackagesDirectory", "~/App_Data/packages".MapHostAbsolutePath())));

            container.Register<IDataContext>(container.Resolve<AppData>());

            //Define the Auth modes you support and where to store it
            Plugins.Add(new AuthFeature(
                () => new CustomUserSession(),
                new IAuthProvider[] {
                    new EmptyAuthProvider()
            }, null));
        }
    }
}