using System;
using System.Collections.Generic;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/embed-scripts/{ScriptId}/gists/{GistHash}/run")]
    public class RunEmbedScript : IReturn<RunEmbedScriptResponse>
    {
        public string ScriptId { get; set; }

        public string GistHash { get; set; }

        public string MainSource { get; set; }

        public List<string> Sources { get; set; }

        public List<AssemblyReference> References { get; set; }

        public string Packages { get; set; }

        public bool NoCache { get; set; }
    }

    public class RunEmbedScriptResponse
    {
        public EmbedScriptExecutionResult Result { get; set; }

        public List<AssemblyReference> References { get; set; }
    }
}

