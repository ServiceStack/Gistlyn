// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System.Collections.Generic;
using ServiceStack;
using ServiceStack.Caching;

namespace Gistlyn.ServiceInterface
{
    public static class CacheExtensions
    {
        const string ScriptPrefix = "script:";

        private static string GetScriptCacheKey(string scriptId)
        {
            var cacheKey = scriptId.StartsWith(ScriptPrefix)
                ? scriptId
                : ScriptPrefix + scriptId;
            return cacheKey;
        }

        public static void SetScriptRunnerInfo(this ICacheClient cache, string scriptId, ScriptRunnerInfo info)
        {
            var cacheKey = GetScriptCacheKey(scriptId);
            cache.Set(cacheKey, info);
        }

        public static ScriptRunnerInfo GetScriptRunnerInfo(this ICacheClient cache, string scriptId)
        {
            if (scriptId == null)
                return null;

            var cacheKey = GetScriptCacheKey(scriptId);
            return cache.Get<ScriptRunnerInfo>(cacheKey);
        }

        public static void RemoveScriptRunnerInfo(this ICacheClient cache, string scriptId)
        {
            var cacheKey = GetScriptCacheKey(scriptId);
            cache.Remove(cacheKey);
        }

        public static IEnumerable<string> GetAllScriptKeys(this ICacheClient cache)
        {
            return cache.GetKeysStartingWith(ScriptPrefix);
        }
    }    
}

