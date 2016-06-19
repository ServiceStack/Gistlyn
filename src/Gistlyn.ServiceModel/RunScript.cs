using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ServiceStack;
using Gistlyn.ServiceModel.Types;

namespace Gistlyn.ServiceModel
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
