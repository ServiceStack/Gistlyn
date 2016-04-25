using System.Collections.Generic;
using Gistlyn.Common.Objects;
using ServiceStack;

public class SearchInstalledPackages : IReturn<SearchInstalledPackagesResponse>
{
    public string Search { get; set; }
}

public class SearchInstalledPackagesResponse
{
    public List<NugetPackageInfo> Packages { get; set; }
}
