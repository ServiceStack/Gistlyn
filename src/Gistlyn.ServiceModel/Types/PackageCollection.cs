using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace Gistlyn.ServiceModel.Types
{
    [Serializable]
    [XmlRoot("packages")]
    public class PackageCollection
    {
        [XmlElement("package")]
        public List<NugetPackageInfo> Packages { get; set; }
    }
}

