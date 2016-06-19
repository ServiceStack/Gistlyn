using System;
using System.Collections.Generic;
using System.Runtime.Versioning;
using Gistlyn.ServiceModel.Types;
using NuGet;

namespace Gistlyn.ServiceInterface
{
    public class FrameworkTargetableAssembly : IFrameworkTargetable
    {
        private readonly List<FrameworkName> frameworks;

        public FrameworkTargetableAssembly(AssemblyReference assembly)
        {
            Assembly = assembly;
            string effectivePath;
            string libPath = assembly.Path.Substring(assembly.Path.IndexOf('/') + 1);
            var fname = VersionUtility.ParseFrameworkNameFromFilePath(libPath, out effectivePath);
            var projectName = VersionUtility.ParseFrameworkName("net45");

            frameworks = new List<FrameworkName>() { fname };
        }

        public AssemblyReference Assembly { get; set; }

        public IEnumerable<FrameworkName> SupportedFrameworks
        {
            get
            {
                return frameworks;
            }
        }

        public long Compatibility { get; set; }
    }
}

