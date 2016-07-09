using System.IO;
using System.Text;

namespace Gistlyn.ServiceInterface
{
    public class ConsoleWriter : TextWriter
    {
        readonly NotifierProxy proxy;
        StringBuilder sb = new StringBuilder();

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
            sb.Append(value);
            if (value == '\n')
            {
                proxy.SendConsoleMessage(sb.ToString());
                sb.Length = 0;
            }
        }
    }
}


