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

            StringBuilder builder = new StringBuilder();

            builder.AppendFormat(@"function init_{0} () {{
var scriptId = ""{0}"";
var gist = ""{1}"";
var noCache = {2};

getGist(gist, scriptId, onGistResponse);

$(""#run_{0}"").click(function() {{ runScript(scriptId, noCache); }});

$(""#cancel_{0}"").click(function() {{ cancelScript(scriptId); }});
           
}}
", scriptId, request.Gist, request.NoCache.ToJson());

            builder.AppendFormat(@"document.write(' \
            <div class=""row""> \
                <div class=""form-group""> \
                    <div class=""row""> \
                        <div class=""form-group""> \
                            <div class=""col-md-6""> \
                                <textarea id=""main_{0}"" class=""form-control role-gisttext"" rows=""10"" required=""required""></textarea> \
                            </div> \
                        </div> \
                    </div> \
					<div class=""row"" style=""margin-top: 15px;""> \
                        <div class=""col-md-5""> \
							<span id=""results_{0}""></span> \
						</div> \
					</div> \
                    <div class=""row""> \
                        <div class=""form-group""> \
                            <div class=""col-md-5""> \
								<button id=""run_{0}"" type=""button"" class=""btn btn-primary role-run"">Run</button> \
		                        <button id=""cancel_{0}"" type=""button"" class=""btn btn-primary role-cancel"" style=""display:none"">Cancel</button> \
                            </div> \
                            <div class=""col-md-1""> \
                                <span id=""status_{0}"" class=""role-status""></span> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
            </div> \
');
", scriptId);

            builder.AppendFormat("init_{0}();", scriptId);
            
            return builder.ToString();
        }

    }
}

