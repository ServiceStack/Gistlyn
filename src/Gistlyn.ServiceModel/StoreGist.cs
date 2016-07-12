using System.Collections.Generic;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    public class StoreGist : IReturn<StoreGistResponse>
    {
        public string Gist { get; set; }
        public bool Public { get; set; }
        public string OwnerLogin { get; set; }
        public string Description { get; set; }
        public Dictionary<string, GithubFile> Files { get; set; }
    }

    public class StoreGistResponse
    {
        public string Gist { get; set; }
        public ResponseStatus ResponseStatus { get; set; }
    }

    public class GithubFile
    {
        public string filename { get; set; }
        public string content { get; set; }
    }
}