using System;
using System.Collections.Generic;

namespace Gistlyn.ServiceModel.Types
{
    [Serializable]
    public class ScriptStateVariables
    {
        public ScriptStatus Status { get; set; }

        public VariableInfo ParentVariable { get; set; }

        public List<VariableInfo> Variables { get; set; }
    }
}

