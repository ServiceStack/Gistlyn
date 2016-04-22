using System;
using System.Collections.Generic;
using Gistlyn.Common.Objects;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class SearchNugetPackage : IReturn<SearchNugetPackageResponse>
    {
        public string Search { get; set; }

        public bool AllowPrereleaseVersion { get; set; }
    }

    public class SearchNugetPackageResponse
    {
        List<NugetPackageInfo> Packages { get; set; }
    }
}

