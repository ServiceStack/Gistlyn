using System;
using System.Collections.Generic;
using Gistlyn.Common.Objects;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class RunJsIncludedScripts : IReturn<RunJsIncludedScriptsResponse>
    {
        public string ScriptId { get; set; }

        public string GistHash { get; set; }

        public string MainCode { get; set; }

        public List<string> Scripts { get; set; }

        public List<AssemblyReference> References { get; set; }

        public string Packages { get; set; }

        public bool NoCache { get; set; }
    }

    public class RunJsIncludedScriptsResponse
    {
        public JsIncludedScriptExecutionResult Result { get; set; }

        public List<AssemblyReference> References { get; set; }
    }
}

