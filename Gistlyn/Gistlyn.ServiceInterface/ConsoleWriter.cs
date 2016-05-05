using System;
using System.IO;
using System.Text;
using Gistlyn.Common.Objects;
using Gistlyn.ServiceInterfaces.Auth;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public class ConsoleWriter : TextWriter
    {
        ConsoleWriterProxy proxy;
        string cache = String.Empty;

        public ConsoleWriter(ConsoleWriterProxy proxy)
        {
            this.proxy = proxy;
        }


        public override Encoding Encoding
        {
            get
            {
                return Encoding.UTF8;
            }
        }

        public override void Write(char value)
        {
            cache += value;
            if (cache.Length >= 32 || value == '\n')
            {
                proxy.SendMessage(cache);
                cache = String.Empty;
            }
        }

        public override void WriteLine(string value)
        {
            base.WriteLine(value);
        }
    }
}


