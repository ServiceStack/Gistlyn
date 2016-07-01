using System.IO;
using Funq;
using Gistlyn.ServiceInterface;
using ServiceStack;
using ServiceStack.Configuration;

namespace Gistlyn
{
    public class AppHost : AppHostBase
    {
        public AppHost()
            : base("Gistlyn", typeof(RunScriptService).Assembly)
        {
            var customSettings = new FileInfo(@"~/appsettings.txt".MapHostAbsolutePath());
            AppSettings = customSettings.Exists
                ? (IAppSettings)new TextFileSettings(customSettings.FullName)
                : new AppSettings();
        }

        public override void Configure(Container container)
        {
            SharedAppHostConfig.Configure(this, "~/App_Data/packages".MapHostAbsolutePath());
        }
    }
}