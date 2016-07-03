using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/test")]
    [Route("/test/{Name}")]
    public class TestServerEvents : IReturn<TestServerEventsResponse>
    {
        public string Name { get; set; }
    }

    public class TestServerEventsResponse
    {
        public string Result { get; set; }
    }

    [Route("/hello/{Name}")]
    public class Hello : IReturn<HelloResponse>
    {
        public string Name { get; set; }
    }

    public class HelloResponse
    {
        public string Result { get; set; }

        public ResponseStatus ResponseStatus { get; set; }
    }
}