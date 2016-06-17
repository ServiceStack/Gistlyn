using System;
using Gistlyn.Common.Objects;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class GetScriptVariableJson : IReturn<ScriptVariableJson>
    {
        public string GistHash { get; set; }

        public string VariableName { get; set; }
    }
}

