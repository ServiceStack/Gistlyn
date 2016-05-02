using System;
using System.IO;
using System.Text;

namespace Gistlyn.ServiceInterface
{
    public class ConsoleWriter : TextWriter
    {
        string result;

        public override Encoding Encoding
        {
            get
            {
                return Encoding.UTF8;
            }
        }

        public override void Write(char value)
        {
            result += value;
        }

        public override void WriteLine(string value)
        {
            base.WriteLine(AppDomain.CurrentDomain.FriendlyName);
            base.WriteLine(value);
        }

        public string GetResult()
        {
            return result;
        }
    }
}

