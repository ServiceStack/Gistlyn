using System;

namespace Gistlyn.ServiceModel.Types
{
    [Serializable]
    public class ScriptVariableJson
    {
        public ScriptStatus Status { get; set; }

        public string Name { get; set; }

        public string Json { get; set; }
    }
}

