using System;
using ServiceStack.Configuration;
using ServiceStack.Auth;
using ServiceStack;
using System.Collections.Generic;
using ServiceStack.Web;

namespace Gistlyn.ServiceInterfaces.Auth
{
    public class EmptyAuthProvider : AuthProvider
    {
        UserSession userSession;

        public EmptyAuthProvider(UserSession userSession)
        {
            this.userSession = userSession;
        }

        /*    public virtual bool TryAuthenticate(IServiceBase authService, string userName, string password)
            {
                var authRepo = authService.TryResolve<IUserAuthRepository>();
                if (authRepo == null)
                {
                    Log.WarnFormat("Tried to authenticate without a registered IUserAuthRepository");
                    return false;
                }

                var session = authService.GetSession();
                UserAuth userAuth = null;
                if (authRepo.TryAuthenticate(userName, password, out userAuth))
                {
                    session.PopulateWith(userAuth);
                    session.IsAuthenticated = true;
                    session.UserAuthId =  userAuth.Id.ToString(CultureInfo.InvariantCulture);
                    session.ProviderOAuthAccess = authRepo.GetUserOAuthProviders(session.UserAuthId)
                        .ConvertAll(x => (IOAuthTokens)x);

                    return true;
                }
                return false;
            }
    */

        #region implemented abstract members of AuthProvider
        public override bool IsAuthorized(IAuthSession session, IAuthTokens tokens, Authenticate request = null)
        {
                return true;
        }

        public override IHttpResult OnAuthenticated(IServiceBase authService, IAuthSession session, IAuthTokens tokens, Dictionary<string, string> authInfo)
        {
            return base.OnAuthenticated(authService, session, tokens, authInfo);
        }

        public override object Authenticate(IServiceBase authService, IAuthSession session, Authenticate request)
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}

