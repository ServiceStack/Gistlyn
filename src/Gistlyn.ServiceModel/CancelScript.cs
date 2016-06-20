using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class CancelScript : IReturn<CancelScriptResponse>
    {
        public string ScriptId { get; set; }
    }

    public class CancelScriptResponse
    {
        public ScriptExecutionResult Result { get; set; }
    }
}

