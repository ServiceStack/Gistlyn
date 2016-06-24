using System.IO;
using Funq;
using Gistlyn.ServiceInterface;
using ServiceStack;
using ServiceStack.Configuration;
using ServiceStack.Text;

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
            JsConfig.EmitCamelCaseNames = true;

            Plugins.Add(new ServerEventsFeature());

            this.Plugins.Add(new CorsFeature());

            container.Register(new AppData(
                AppSettings.Get("NugetPackagesDirectory", "~/App_Data/packages".MapHostAbsolutePath())));

            container.Register<IDataContext>(container.Resolve<AppData>());
        }
    }
}