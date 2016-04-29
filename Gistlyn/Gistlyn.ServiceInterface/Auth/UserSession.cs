using Gistlyn.Common.Interfaces;
using ServiceStack.Caching;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Web;
using System.Threading.Tasks;
using Gistlyn.Common.Objects;

namespace Gistlyn.ServiceInterfaces.Auth
{
    public class UserSession
    {
        ICacheClient cache;

        public UserSession(ICacheClient cache)
        {
            this.cache = cache;
        }

        public void SetGistHash(string hash)
        {
            var session = SessionFeature.GetOrCreateSession<CustomUserSession>(cache);
            string key = SessionFeature.GetSessionKey();
            session.GistHash = hash;
            cache.Set<CustomUserSession>(key, session);
        }

        public void SetScriptTask(Task<ScriptExecutionResult> task)
        {
            var session = SessionFeature.GetOrCreateSession<CustomUserSession>(cache);
            string key = SessionFeature.GetSessionKey();
            session.ScriptTask = task;
            cache.Set<CustomUserSession>(key, session);
        }

        public void LogoutUser()
        {
            string key = SessionFeature.GetSessionKey();
            cache.Remove(key);
        }

        public CustomUserSession GetCustomSession()
        {
            return SessionFeature.GetOrCreateSession<CustomUserSession>(cache); ;

            //if we need to check that the user is not authenticated yet (session can be null in this case);
            //string key = SessionFeature.GetSessionKey();
            //return cache.Get<CustomUserSession>(key);
        }
    }
}

