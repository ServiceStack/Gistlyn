using System;
using System.Text;
using Gistlyn.ServiceModel;
using ServiceStack;

namespace Gistlyn.ServiceInterface
{
    public class IncludeJsScriptService : Service
    {
        [AddHeader(ContentType = "text/javascript")]
        public object Any(GetEmbedScript request)
        {
            var scriptId = Guid.NewGuid().ToString().Replace("-", string.Empty);
            var url = string.Empty;
            int idx = Request.AbsoluteUri.IndexOf(Request.RawUrl, StringComparison.OrdinalIgnoreCase);

            if (idx > 0)
                url = Request.AbsoluteUri.Substring(0, idx);

            var htmlContent = VirtualFileSources.GetFile("templates/embed.html").ReadAllText();
            var scriptContent = VirtualFileSources.GetFile("templates/embed.init.js").ReadAllText();

            var sb = new StringBuilder();

            sb.AppendFormat(scriptContent, scriptId, request.Gist, request.NoCache.ToJson(), url);

            htmlContent = htmlContent.Replace("\r", string.Empty).Replace("\n", "\\\n").Replace("'", "''");
            htmlContent = string.Format(htmlContent, scriptId);

            sb.AppendFormat("document.write('{0}');\n", htmlContent);
            sb.AppendFormat("init_{0}();\n", scriptId);

            return sb.ToString();
        }
    }
}

