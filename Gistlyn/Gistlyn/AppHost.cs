using Funq;
using ServiceStack;
using Gistlyn.ServiceInterface;
using ServiceStack.Configuration;
using Gistlyn.Common.Objects;
using Gistlyn.Common.Interfaces;
using Gistlyn.DataContext;
using ServiceStack.Data;
using ServiceStack.OrmLite;
using ServiceStack.Caching;
using Gistlyn.ServiceInterfaces.Auth;
using ServiceStack.Auth;
using System.Collections.Generic;
using System.Net;
using System.Linq;
using System;

namespace Gistlyn
{
    public class AppHost : AppHostBase
    {
        /// <summary>
        /// Default constructor.
        /// Base constructor requires a name and assembly to locate web service classes. 
        /// </summary>
        public AppHost()
            : base("Gistlyn", typeof(MyServices).Assembly)
        {

        }

        /// <summary>
        /// Application specific configuration
        /// This method should initialize any IoC resources utilized by your web service classes.
        /// </summary>
        /// <param name="container"></param>
        public override void Configure(Container container)
        {
            Plugins.Add(new ServerEventsFeature()
            {
                HeartbeatInterval = TimeSpan.FromSeconds(30),
                OnConnect = (IEventSubscription arg1, Dictionary<string, string> arg2) =>
                {
                    Console.WriteLine("OnConnect");
                },
                OnCreated = (IEventSubscription arg1, ServiceStack.Web.IRequest arg2) =>
                {
                    Console.WriteLine("OnCreated");
                },
                OnSubscribe = (IEventSubscription obj) => 
                { 
                    Console.WriteLine("OnSubscribe");
                },
                OnUnsubscribe = (IEventSubscription obj) => 
                {
                    Console.WriteLine("OnUnsubscribe");
                }
            });
            //this.CustomErrorHttpHandlers.Remove(HttpStatusCode.Forbidden);

            //container.RegisterAutoWiredAs<MemoryChatHistory, IChatHistory>();

            //session and authentication
            container.Register<ICacheClient> (new MemoryCacheClient ());
            Plugins.Add (new SessionFeature ());
            container.Register<UserSession> (new UserSession (container.Resolve<ICacheClient> ()));

            //Config examples
            //this.Plugins.Add(new PostmanFeature());
            //this.Plugins.Add(new CorsFeature());

            container.Register<IAppSettings>(new AppSettings());

            var config = new WebHostConfig(container.Resolve<IAppSettings>());

            container.Register<WebHostConfig>(config);

            IDbConnectionFactory dbFactory = new OrmLiteConnectionFactory(
                config.ConnectionString,
                SqliteDialect.Provider);

            dbFactory.Open();

            container.Register<IDataContext>(new GistlynDataContext(dbFactory));

            //Define the Auth modes you support and where to store it
            ConfigureAuthAndRegistrationServices (container);
        }

        private void ConfigureAuthAndRegistrationServices (Funq.Container container)
        {
            //Enable and register existing services you want this host to make use of.
            var userSession = new CustomUserSession ();

            //Register all Authentication methods you want to enable for this web app.
            Plugins.Add (new AuthFeature (
                () => userSession,
                new IAuthProvider [] {
                new EmptyAuthProvider(container.Resolve<UserSession>())
            }, null));

            //Provide service for new users to register so they can login with supplied credentials.
            //RegistrationFeature.Init(this);

            //override the default registration validation
            //container.RegisterAs<CustomRegistrationValidator, IValidator<Registration>>();

            //Store User Data 
            container.Register<IUserAuthRepository> (c =>
                 new InMemoryAuthRepository ());

            //var authRepo = (OrmLiteAuthRepository)container.Resolve<IUserAuthRepository>();
            //authRepo.DropAndReCreateTables(); //Drop and re-create all Auth and registration tables
            //authRepo.CreateMissingTables(); //Create only the missing tables

            return;
        }
    }
}