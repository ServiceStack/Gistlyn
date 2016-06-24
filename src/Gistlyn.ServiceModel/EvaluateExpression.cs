using System;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/scripts/evaluate")]
    public class EvaluateExpression
    {
        public string ScriptId { get; set; }

        public string Expression { get; set; }
    }
}

