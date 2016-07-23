using Funq;
using Gistlyn.ServiceInterface;
using ServiceStack;
using ServiceStack.Configuration;

namespace Gistlyn
{
    public partial class AppHost : AppHostBase
    {
        public AppHost()
            : base("Gistlyn", typeof(RunScriptService).Assembly)
        {
            var defaultSettings = SharedAppHostConfig.GetMemoryAppSettings();
            OverrideAppSettings(defaultSettings);
            AppSettings = defaultSettings;
        }

        public override void Configure(Container container)
        {
            SharedAppHostConfig.Configure(this, "~/App_Data/packages".MapHostAbsolutePath());
        }

        static partial void OverrideAppSettings(DictionarySettings appSettings);
    }
}