using System;
namespace Gistlyn.Common.Objects
{
    [Serializable]
    public class ScriptVariableJson
    {
        public ScriptStatus Status { get; set; }

        public string Name { get; set; }

        public string Json { get; set; }
    }
}

