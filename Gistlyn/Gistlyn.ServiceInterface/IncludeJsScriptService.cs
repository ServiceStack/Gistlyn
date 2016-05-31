using System;
using System.Text;
using Gistlyn.ServiceModel;
using ServiceStack;

namespace Gistlyn.ServiceInterfaces
{
    public class IncludeJsScriptService : Service
    {

        [AddHeader(ContentType = "text/javascript")]
        public object Any(GetIncludeScript request)
        {
             string scriptId = Guid.NewGuid().ToString().Replace("-", String.Empty);
             var url = String.Empty;
             int idx = Request.AbsoluteUri.IndexOf(Request.RawUrl, StringComparison.OrdinalIgnoreCase);

             if (idx > 0)
                 url = Request.AbsoluteUri.Substring(0, idx);

             var htmlContent = VirtualFileSources.GetFile("templates/jsincluded.html").ReadAllText();
             var scriptContent = VirtualFileSources.GetFile("templates/jsincluded.init.js").ReadAllText();

             StringBuilder builder = new StringBuilder();

             builder.AppendFormat(scriptContent, scriptId, request.Gist, request.NoCache.ToJson(), url);

             htmlContent = htmlContent.Replace("\r", String.Empty).Replace("\n", "\\\n").Replace("'", "''");
             htmlContent = String.Format(htmlContent, scriptId);

             builder.AppendFormat("document.write('{0}');\n", htmlContent);
             builder.AppendFormat("init_{0}();\n", scriptId);

             return builder.ToString();
        }

    }
}

