using Funq;
using ServiceStack;
using Gistlyn.ServiceInterface;
using ServiceStack.Configuration;
using Gistlyn.Common.Objects;

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
            //Config examples
            //this.Plugins.Add(new PostmanFeature());
            //this.Plugins.Add(new CorsFeature());

            container.Register<IAppSettings>(new AppSettings());

            container.Register<WebHostConfig>(new WebHostConfig(container.Resolve<IAppSettings>()));
        }
    }
}