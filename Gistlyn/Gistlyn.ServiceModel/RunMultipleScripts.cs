using System;
using System.Collections.Generic;
using Gistlyn.Common.Objects;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class RunMultipleScripts : IReturn<RunMultipleScriptResponse>
    {
        public string MainCode { get; set; }

        public List<string> Scripts { get; set; }
    }

    public class RunMultipleScriptResponse
    {
        public ScriptExecutionResult Result { get; set; }
    }
}

