using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace Gistlyn.Common.Objects
{
    [Serializable]
    [XmlRoot("packages")]
    public class PackageCollection
    {
        [XmlElement("package")]
        public List<NugetPackageInfo> Packages { get; set; }
    }
}

