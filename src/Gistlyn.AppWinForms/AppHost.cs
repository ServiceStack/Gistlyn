using Funq;
using ServiceStack;
using Gistlyn.Resources;
using Gistlyn.ServiceInterface;

namespace Gistlyn.AppWinForms
{
    public class AppHost : AppSelfHostBase
    {
        /// <summary>
        /// Default constructor.
        /// Base constructor requires a name and assembly to locate web service classes. 
        /// </summary>
        public AppHost()
            : base("Gistlyn.AppWinForms", typeof(RunScriptService).Assembly)
        {
            AppSettings = SharedAppHostConfig.GetMemoryAppSettings();
        }

        /// <summary>
        /// Application specific configuration
        /// This method should initialize any IoC resources utilized by your web service classes.
        /// </summary>
        /// <param name="container"></param>
        public override void Configure(Container container)
        {
            SetConfig(new HostConfig
            {
                DebugMode = true,
                EmbeddedResourceBaseTypes = { typeof(AppHost), typeof(SharedEmbeddedResources) },
            });

            var packagesPath = "~/packages".MapAbsolutePath();
            SharedAppHostConfig.Configure(this, packagesPath);
        }
    }
}
