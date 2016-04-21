function bind()
{
	$("#load").click(getGist);

    $("#multirun").click(runMultiple);

    $("#gistlist").on("click", "button.role-run", function(e){
        runGist($(e.target).closest("div.role-execblock"));
        //console.log($("textarea", $(e.target).closest("div.row")).val());
    });
}

function getGist()
{
	var gistId = $("#gistId").val();

	$.get({
		url: "https://api.github.com/gists/" + gistId,
		success: function(response) {
            //clear run multiple
            $("#multirunBlock table.role-variables tbody").empty();
            $("#multirunBlock table.role-errors tbody").empty();
            $("#multirunBlock span.role-exception").hide();
            //show "multirun" button
            $("#multirun").toggle(Object.keys(response.files).length > 1);

            $("#gistlist").empty();
            var template = Handlebars.compile( $("#gists-template").html() );
            $("#gistlist").append( template(response) );
        },
		datatype: "jsonp"
	});
}

function runGist($block)
{
    var content = $("textarea", $block).val();
	gateway.postToService({RunScript : {code : content}},
		function(response) {
            scriptExecResponse($block, response);
		},
		function(error) { alert(error); }
	);
}

function scriptExecResponse($block, response)
{
    $("div.role-gistresult", $block).show();
    $("table.role-variables tbody", $block).empty();
    var hasVars = response.Result.Variables && response.Result.Variables.length > 0;
    if (hasVars) {
        $.each(response.Result.Variables, function(idx, variable) {
            var el = $("<tr></tr>");
            var name = $("<td>").text(variable.Name);
            var value = $("<td>").text(variable.Value);
            var type = $("<td>").text(variable.Type);
            el.append(name).append(value).append(type);
            $("table.role-variables tbody", $block).append(el);
        });
    }

    $("table.role-errors tbody", $block).empty();
    var hasErrors = response.Result.Errors && response.Result.Errors.length > 0;
    if (hasErrors) {
        $.each(response.Result.Errors, function(idx, error) {
            var el = $("<tr></tr>").append(error.Info);
            $("table.role-errors tbody", $block).append(el);
        });
    }

    var hasException = !!response.Result.Exception;
    if (hasException) {
        $("span.role-exception").text(response.Result.Exception);
    }

    $("table.role-variables tbody", $block).closest("div.row").toggle(hasVars);
    $("table.role-errors tbody", $block).closest("div.row").toggle(hasErrors);
    $("span.role-exception", $block).closest("div.row").toggle(hasException);
}

function runMultiple()
{
    var filenames = $("#gistlist .role-filename").text();
    var main = $.grep($("#gistlist .role-filename"), function(val){ return $(val).text().toUpperCase() == "MAIN.CS" });

    if (main.length != 1) {
        alert("There must be at file 'Main.cs' and it must be only one");
    }

    var mainCode = $("textarea", $(main[0]).closest("div.row")).val();
    var sources = [];

    $.each($("#gistlist .role-execblock"), function(idx, val) {
        if ($(".role-filename", $(val)).text().toUpperCase() != "MAIN.CS") {
            sources.push($("textarea",$(val)).val());
        }
    });

    gateway.postToService({RunMultipleScripts : {mainCode : mainCode, scripts: sources}},
        function(response) {
            scriptExecResponse($("#multirunBlock"), response);
        },
        function(error) { alert(error); }
    );

}