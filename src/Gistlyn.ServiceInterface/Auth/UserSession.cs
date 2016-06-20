using System;
using ServiceStack;
using ServiceStack.Caching;

namespace Gistlyn.ServiceInterface.Auth
{
    public class UserSession
    {
        readonly ICacheClient cache;

        public UserSession(ICacheClient cache)
        {
            this.cache = cache;
        }

        public string GetSessionId()
        {
            var keyParts =  SessionFeature.GetSessionKey().Split(':');
            return keyParts[keyParts.Length - 1];
        }

        public void SetScriptRunnerInfo(string scriptId, AppDomain scriptAppDomain, DomainWrapper wrapper)
        {
            var session = SessionFeature.GetOrCreateSession<CustomUserSession>(cache);
            var key = SessionFeature.GetSessionKey();
            var info = new ScriptRunnerInfo { ScriptId = scriptId, ScriptDomain = scriptAppDomain, DomainWrapper = wrapper };

            lock (session.lockObj)
            {
                if (session.Scripts.ContainsKey(scriptId))
                    session.Scripts[scriptId] = info;
                else
                    session.Scripts.Add(scriptId, info);
                    
            }
            cache.Set(key, session);
        }

        public ScriptRunnerInfo GetScriptRunnerInfo(string scriptId)
        {
            var session = SessionFeature.GetOrCreateSession<CustomUserSession>(cache);
            lock (session.lockObj)
            {
                return session.Scripts.ContainsKey(scriptId) ? session.Scripts[scriptId] : null;
            }
        }

        public void LogoutUser()
        {
            var key = SessionFeature.GetSessionKey();
            cache.Remove(key);
        }

        public CustomUserSession GetCustomSession()
        {
            return SessionFeature.GetOrCreateSession<CustomUserSession>(cache);

            //if we need to check that the user is not authenticated yet (session can be null in this case);
            //string key = SessionFeature.GetSessionKey();
            //return cache.Get<CustomUserSession>(key);
        }
    }
}

