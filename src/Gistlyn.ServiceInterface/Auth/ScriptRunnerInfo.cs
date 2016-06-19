using System;

namespace Gistlyn.ServiceInterface.Auth
{
    public class ScriptRunnerInfo
    {
        public string GistHash { get; set; }

        public DomainWrapper DomainWrapper { get; set; }

        public AppDomain ScriptDomain { get; set; }
    }
}

