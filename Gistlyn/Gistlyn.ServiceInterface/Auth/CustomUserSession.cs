using System.Security.Cryptography;
using System.Text;
using ServiceStack.Logging;
using System.Collections.Generic;
using ServiceStack;
using ServiceStack.Auth;
using System.Threading.Tasks;
using Gistlyn.Common.Objects;

namespace Gistlyn.ServiceInterfaces.Auth
{
    /// <summary>
    /// Create your own strong-typed Custom AuthUserSession where you can add additional AuthUserSession 
    /// fields required for your application. The base class is automatically populated with 
    /// User Data as and when they authenticate with your application. 
    /// </summary>
    public class CustomUserSession : AuthUserSession
    {
        private static ILog log = LogManager.GetLogger(typeof(CustomUserSession));

        public bool IsRunning { get; set; }

        public string GistHash { get; set; }

        public Task<ScriptExecutionResult> ScriptTask { get; set; }

        public CustomUserSession()
        {
        }

        public override void OnAuthenticated(IServiceBase authService, IAuthSession session, IAuthTokens tokens, Dictionary<string, string> authInfo)
        {
            log.Debug("OnAuthenticated");
            base.OnAuthenticated(authService, session, tokens, authInfo);
            log.Debug("Custom.OnAuthenticated");

            //get user from db
            //IDataStore store = authService.TryResolve<IDataStore>();

            //authService.SaveSession(this, TimeSpan.FromDays(7 * 2));



            //Resolve the DbFactory from the IOC and persist the user info
            //authService.TryResolve<IDbConnectionFactory>().Exec(dbCmd => dbCmd.Save(user));
        }

        public override bool IsAuthorized(string provider)
        {
            return true;
        }

        private static string CreateGravatarUrl(string email, int size = 64)
        {
            var md5 = MD5.Create();
            var md5HadhBytes = md5.ComputeHash(email.ToUtf8Bytes());

            var sb = new StringBuilder();
            for (var i = 0; i < md5HadhBytes.Length; i++)
            {
                sb.Append(md5HadhBytes[i].ToString("x2"));
            }

            string gravatarUrl = "http://www.gravatar.com/avatar/{0}?d=mm&s={1}".Fmt(sb, size);
            return gravatarUrl;
        }
    }

}

