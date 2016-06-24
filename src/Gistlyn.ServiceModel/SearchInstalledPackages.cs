using System.Collections.Generic;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/packages/search/{Search}")]
    public class SearchInstalledPackages : IReturn<SearchInstalledPackagesResponse>
    {
        public string Search { get; set; }
    }

    public class SearchInstalledPackagesResponse
    {
        public List<NugetPackageInfo> Packages { get; set; }
    }
}