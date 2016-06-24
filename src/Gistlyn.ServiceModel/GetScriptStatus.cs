using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/scripts/{ScriptId}/status")]
    public class GetScriptStatus : IReturn<ScriptStatusResponse>
    {
        public string ScriptId { get; set; }
    }

    public class ScriptStatusResponse
    { 
        public ScriptStatus Status { get; set; }
    }
}

