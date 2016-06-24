using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/scripts/{ScriptId}/vars/{VariableName}/json")]
    public class GetScriptVariableJson : IReturn<ScriptVariableJson>
    {
        public string ScriptId { get; set; }

        public string VariableName { get; set; }
    }
}

