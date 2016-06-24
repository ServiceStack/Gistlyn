using ServiceStack;
using Gistlyn.ServiceModel.Types;

namespace Gistlyn.ServiceModel
{
    [Route("/evaluate")]
    public class EvaluateSource : IReturn<EvaluateSourceResponse>
    {
        public string Code { get; set; }
    }

    public class EvaluateSourceResponse
    {
        public ScriptExecutionResult Result { get; set;}
    }
}
