namespace Gistlyn.ServiceModel.Types
{
    public class MemoizedResult
    {
        public int Id { get; set; }

        public string CodeHash { get; set; }

        public JsIncludedScriptExecutionResult Result { get; set; }
    }
}

