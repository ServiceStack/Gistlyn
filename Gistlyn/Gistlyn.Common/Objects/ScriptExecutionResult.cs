using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Gistlyn.Common.Objects
{
    [Serializable]
    public class ScriptExecutionResult
    {
        public ScriptStatus Status { get; set; }

        public List<VariableInfo> Variables { get; set; }

        public List<ErrorInfo> Errors { get; set; }

        public Exception Exception { get; set; }

        public string Console { get; set; }
    }
}
