using System.Collections.Generic;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

public class SearchInstalledPackages : IReturn<SearchInstalledPackagesResponse>
{
    public string Search { get; set; }
}

public class SearchInstalledPackagesResponse
{
    public List<NugetPackageInfo> Packages { get; set; }
}
