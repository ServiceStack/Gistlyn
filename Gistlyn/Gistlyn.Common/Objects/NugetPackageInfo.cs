using System;
using System.Collections.Generic;

namespace Gistlyn.Common.Objects
{
    public class NugetPackageInfo
    {
        public string Id { get; set; }

        public Version Version { get; set; }

        public string Ver { get; set; }

        public List<AssemblyReference> Assemblies { get; set; }
    }
}

