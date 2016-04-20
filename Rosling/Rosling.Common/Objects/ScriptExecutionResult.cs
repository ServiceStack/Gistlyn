using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rosling.Common.Objects
{
    public class ScriptExecutionResult
    {
        public List<VariableInfo> Variables { get; set; }

        public List<ErrorInfo> Errors { get; set; }

        public Exception Exception { get; set; }
    }
}
