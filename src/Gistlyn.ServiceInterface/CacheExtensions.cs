using Gistlyn.ServiceInterface.Auth;
using ServiceStack.Caching;

namespace Gistlyn.ServiceInterface
{
    public static class CacheExtensions
    {
        public static void SetScriptRunnerInfo(this ICacheClient cache, string scriptId, ScriptRunnerInfo info)
        {
            cache.Set(scriptId, info);
        }

        public static ScriptRunnerInfo GetScriptRunnerInfo(this ICacheClient cache, string scriptId)
        {
            return cache.Get<ScriptRunnerInfo>(scriptId);
        }

        public static void RemoveScriptRunnerInfo(this ICacheClient cache, string scriptId)
        {
            cache.Remove(scriptId);
        }
    }    
}

