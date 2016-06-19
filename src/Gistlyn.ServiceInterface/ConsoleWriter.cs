using System;
using System.IO;
using System.Text;

namespace Gistlyn.ServiceInterface
{
    public class ConsoleWriter : TextWriter
    {
        readonly NotifierProxy proxy;
        string cache = string.Empty;

        public ConsoleWriter(NotifierProxy proxy)
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
                proxy.SendConsoleMessage(cache);
                cache = string.Empty;
            }
        }

        public override void WriteLine(string value)
        {
            base.WriteLine(value);
        }
    }
}


