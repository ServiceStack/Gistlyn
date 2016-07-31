#if DEBUG
using System.Collections.Generic;
using ServiceStack;
using ServiceStack.Configuration;

namespace Gistlyn.ServiceInterface
{
    [Route("/debug")]
    public class Debug : IReturn<DebugResponse> { }

    public class DebugResponse
    {
        public Dictionary<string, string> AppSettings { get; set; }
    }

    public class DebugService : Service
    {
        public IAppSettings AppSettings { get; set; }

        public object Any(Debug request)
        {
            var appSettings = new Dictionary<string, string>();
            AppSettings.GetAllKeys().Each(x => appSettings[x] = AppSettings.GetString(x));

            return new DebugResponse
            {
                AppSettings = appSettings
            };
        }
    }
}
#endif
