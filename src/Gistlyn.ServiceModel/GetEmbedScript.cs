using System;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/gists/{Gist}/embed")]
    public class GetEmbedScript
    {
        public string Gist { get; set; }

        public bool NoCache { get; set; }
    }
}

