using System.Collections;
using System.Collections.Generic;
using ServiceStack;

namespace Gistlyn.SnippetEngine
{
    public static class ScriptUtils
    {
        public static string ToJson(object value)
        {
            return value.ToSafeJson();
        }
    }
}