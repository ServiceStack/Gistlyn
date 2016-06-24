using System;
using System.Collections.Generic;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/nuget/packages/search/{Search}")]
    public class SearchNugetPackages : IReturn<SearchNugetPackagesResponse>
    {
        public string Search { get; set; }

        public bool AllowPrereleaseVersion { get; set; }
    }

    public class SearchNugetPackagesResponse
    {
        public List<NugetPackageInfo> Packages { get; set; }
    }
}

