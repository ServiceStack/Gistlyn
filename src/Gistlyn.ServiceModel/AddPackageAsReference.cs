using System;
using System.Collections.Generic;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/packages/references")]
    public class AddPackageAsReference : IReturn<AddPackageAsReferenceResponse>
    {
        public string PackageId { get; set; }

        public string Version { get; set; }
    }

    public class AddPackageAsReferenceResponse
    {
        public List<AssemblyReference> Assemblies { get; set; }
    }
}

