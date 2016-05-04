using System;
using System.Collections.Generic;

namespace Gistlyn.Common.Objects
{
    [Serializable]
    public class ScriptStateVariables
    {
        public ScriptStatus Status { get; set; }

        public string ParentVariable { get; set; }

        public List<VariableInfo> Variables { get; set; }
    }
}

