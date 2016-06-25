using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using ServiceStack;

namespace Gistlyn.ServiceModel.Types
{
    [Serializable]
    public class EmbedScriptExecutionResult
    {
        public ScriptStatus Status { get; set; }

        public List<ErrorInfo> Errors { get; set; }

        [IgnoreDataMember]
        public Exception Exception { get; set; }

        public ResponseStatus ErrorResponseStatus
        {
            get { return Exception != null ? new ResponseStatus(Exception.GetType().Name, Exception.Message) : null; }
        }

        public ScriptVariableJson LastVariableJson { get; set; }
    }
}

