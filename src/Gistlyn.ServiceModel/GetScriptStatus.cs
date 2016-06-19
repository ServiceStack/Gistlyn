using System;
using Gistlyn.ServiceModel.Types;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class GetScriptStatus : IReturn<ScriptStatusResponse>
    {
        public string GistHash { get; set; }
    }

    public class ScriptStatusResponse
    { 
        public ScriptStatus Status { get; set; }
    }
}

