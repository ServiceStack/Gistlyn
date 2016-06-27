using System.Collections.Generic;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/scripts/{ScriptId}/run")]
    public class RunScript : IReturn<RunScriptResponse>
    {
        public string ScriptId { get; set; }

        public string MainSource { get; set; }

        public List<string> Sources { get; set; }

        public string PackagesConfig { get; set; }

        public List<AssemblyReference> References { get; set; }

        public bool ForceRun { get; set; }
    }

    public class RunScriptResponse
    {
        public ScriptExecutionResult Result { get; set; }

        public List<AssemblyReference> References { get; set; }
    }
}

