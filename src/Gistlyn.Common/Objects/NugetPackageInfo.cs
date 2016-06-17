using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace Gistlyn.Common.Objects
{
    [Serializable]
    public class NugetPackageInfo
    {
        [XmlAttribute("id")]
        public string Id { get; set; }

        public Version Version { get; set; }

        [XmlAttribute("version")]
        public string Ver { get; set; }

        [XmlAttribute("targetFramework")]
        public string TargetFramework { get; set; }

        public List<AssemblyReference> Assemblies { get; set; }
    }
}

