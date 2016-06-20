using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/hello/{Name}")]
    public class TestServerEvents : IReturn<TestServerEventsResponse>
    {
        public string Name { get; set; }
    }

    public class TestServerEventsResponse
    {
        public string Result { get; set; }
    }
}