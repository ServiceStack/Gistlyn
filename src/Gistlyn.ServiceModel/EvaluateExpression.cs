using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/scripts/{ScriptId}/evaluate")]
    public class EvaluateExpression : IReturn<EvaluateExpressionResponse>
    {
        public string ScriptId { get; set; }

        public string Expression { get; set; }

        public bool IncludeJson { get; set; }
    }

    public class EvaluateExpressionResponse
    {
        public ScriptExecutionResult Result { get; set; }

        public ResponseStatus ResponseStatus { get; set; }
    }

}

