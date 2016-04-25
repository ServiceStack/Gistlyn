using System;
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
            NugetPackagesDirectory = appConfig.GetString("NugetPackagesDirectory");
            ConnectionString = appConfig.GetString("ConnectionString");
        }
    }
}

