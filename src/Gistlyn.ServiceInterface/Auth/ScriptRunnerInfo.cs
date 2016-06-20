using System;

namespace Gistlyn.ServiceInterface.Auth
{
    public class ScriptRunnerInfo : IDisposable
    {
        public string GistHash { get; set; }

        public DomainWrapper DomainWrapper { get; set; }

        public AppDomain ScriptDomain { get; set; }

        public void Dispose()
        {
            if (DomainWrapper != null)
                DomainWrapper.Cancel();

            if (ScriptDomain != null)
                AppDomain.Unload(ScriptDomain);
        }
    }
}

