using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ServiceStack;
using Rosling.Common.Objects;

namespace Rosling.ServiceModel
{
    public class RunScript : IReturn<RunScriptResponse>
    {
        public string Code { get; set; }
    }

    public class RunScriptResponse
    {
        public ScriptExecutionResult Result { get; set;}
    }
}
