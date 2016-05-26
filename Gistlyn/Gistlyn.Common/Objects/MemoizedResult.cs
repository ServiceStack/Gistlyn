using System;
namespace Gistlyn.Common.Objects
{
    public class MemoizedResult
    {
        public int Id { get; set; }

        public string CodeHash { get; set; }

        public ScriptVariableJson Result { get; set; }
    }
}

