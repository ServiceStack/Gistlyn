using System;
using Funq;
using Gistlyn.ServiceInterface;
using ServiceStack;
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

            this.Plugins.Add(new CorsFeature());

            container.Register(new AppData(
                AppSettings.Get("NugetPackagesDirectory", "~/App_Data/packages".MapHostAbsolutePath())));

            container.Register<IDataContext>(container.Resolve<AppData>());
        }

        public override void Dispose()
        {
            base.Dispose();

            var memCache = (MemoryCacheClient) Resolve<ICacheClient>();
            var allKeys = memCache.GetAllKeys();
            foreach (var key in allKeys)
            {
                using (memCache.Get(key) as IDisposable) {}
            }
        }
    }
}