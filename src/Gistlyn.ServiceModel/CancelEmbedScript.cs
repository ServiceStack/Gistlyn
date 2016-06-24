using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/embed-scripts/{ScriptId}/cancel")]
    public class CancelEmbedScript : IReturn<CancelEmbedScriptResponse>
    {
        public string ScriptId { get; set; }
    }

    public class CancelEmbedScriptResponse
    {
        public ScriptExecutionResult Result { get; set; }
    }
}

