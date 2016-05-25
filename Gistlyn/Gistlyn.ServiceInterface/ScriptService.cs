using System;
using System.Text;
using Gistlyn.ServiceModel;
using ServiceStack;

namespace Gistlyn.ServiceInterfaces
{
    public class ScriptService : Service
    {

        [AddHeader(ContentType = "text/javascript")]
        public object Any(GetIncludeScript request)
        {
            string scriptId = Guid.NewGuid().ToString().Replace("-", String.Empty);

            StringBuilder builder = new StringBuilder();

            builder.AppendFormat(@"function init_{0} () {{
var scriptId = ""{0}"";
var gist = ""{1}"";
var noCache = {2};

getGist(gist, scriptId, onGistResponse);
           
}}

init_{0}();", scriptId, request.Gist, request.NoCache.ToJson());

            builder.AppendFormat(@"document.write(' \
            <div class=""row""> \
                <div class=""form-group""> \
                    <div class=""row voffset3""> \
                        <div class=""form-group""> \
                            <div class=""col-md-6""> \
                                <textarea id=""main_{0}"" class=""form-control role-gisttext"" rows=""10"" required=""required""></textarea> \
                            </div> \
                                <button id=""run_{0}"" type=""button"" class=""btn btn-primary role-run hide"">Run</button> \
		                        <button id=""cancel_{0}"" type=""button"" class=""btn btn-primary"" style=""display:none"">Cancel</button> \
                            </div> \
                        </div> \
                    </div> \
                    <div class=""col-md-4""> \
                        <button id=""multirun"" type=""button"" class=""btn btn-primary"" style=""display:none"">Run</button> \
                    </div> \
                </div> \
            </div> \
');
", scriptId);
            
            return builder.ToString();
        }

    }
}

