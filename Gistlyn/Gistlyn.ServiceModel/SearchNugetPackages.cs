using System;
using System.Collections.Generic;
using Gistlyn.Common.Objects;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
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

