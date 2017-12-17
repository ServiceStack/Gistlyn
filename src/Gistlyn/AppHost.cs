using Funq;
using Gistlyn.ServiceInterface;
using ServiceStack;
using ServiceStack.Configuration;
using ServiceStack.IO;

namespace Gistlyn
{
    public partial class AppHost : AppHostBase
    {
        public AppHost()
            : base("Gistlyn", typeof(RunScriptService).Assembly)
        {
            var appSettings = SharedAppHostConfig.GetMemoryAppSettings();
            OverrideAppSettings(appSettings);
            AppSettings = appSettings;
        }

        public override void Configure(Container container)
        {
            SharedAppHostConfig.Configure(this, "~/App_Data/packages".MapHostAbsolutePath());
            VirtualFiles = new FileSystemVirtualFiles(MapProjectPath("~/"));
            Config.WebHostPhysicalPath = MapProjectPath("~/wwwroot");
            Config.DebugMode = true;
        }

        static partial void OverrideAppSettings(DictionarySettings appSettings);
    }
}