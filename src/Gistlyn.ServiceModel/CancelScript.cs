using System;
using Gistlyn.Common.Objects;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class CancelScript : IReturn<CancelScriptResponse>
    {
        public string GistHash { get; set; }
    }

    public class CancelScriptResponse
    {
        public ScriptExecutionResult Result { get; set; }
    }
}

