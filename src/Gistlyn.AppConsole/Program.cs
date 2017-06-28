using ServiceStack.Text;
using System;
using System.Diagnostics;
using System.Threading;

namespace Gistlyn.AppConsole
{
    static class Program
    {
        public static string HostUrl = "http://localhost:4000/";

        /// <summary>
        /// The main entry point for the application
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            new AppHost().Init().Start("http://*:4000/");
            $"ServiceStack SelfHost listening at {HostUrl}".Print();
            Process.Start(HostUrl);

            Thread.Sleep(Timeout.Infinite);
        }
    }
}
