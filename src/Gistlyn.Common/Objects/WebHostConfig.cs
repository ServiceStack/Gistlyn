using System;
using ServiceStack;
using ServiceStack.Configuration;

namespace Gistlyn.Common.Objects
{
    public class WebHostConfig
    {
        public string NugetPackagesDirectory { get; set; }

        public string ConnectionString { get; set; }

        public WebHostConfig()
        {
        }

        public WebHostConfig(IAppSettings appConfig)
        {
            NugetPackagesDirectory = appConfig.Get("NugetPackagesDirectory", "~/App_Data/packages".MapHostAbsolutePath());
            ConnectionString = appConfig.Get("ConnectionString", "~/App_Data/db.sqlite".MapHostAbsolutePath());
        }
    }
}

