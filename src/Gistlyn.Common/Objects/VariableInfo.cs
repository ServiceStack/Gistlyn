using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Gistlyn.Common.Objects
{
    [Serializable]
    public class VariableInfo
    {
        public string Name { get; set; }

        public string Value { get; set; }

        public string Type { get; set; }

        public bool IsBrowseable { get; set; }
    }
}
