using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/scripts/{ScriptId}/vars/{VariableName}")]
    public class GetScriptVariables : IReturn<ScriptStateVariables>
    {
        public string ScriptId { get; set; }

        public string VariableName { get; set; }
    }
}

