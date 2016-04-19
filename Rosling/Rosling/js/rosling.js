function bind()
{
	$("#load").click(getGist);
	$("#run").click(runGist);
}

function getGist()
{
	var gistId = $("#gistId").val();

	$.get({
		url: "https://api.github.com/gists/" + gistId,
		success: function(response) {
			//var filename="gistfile1.txt";
			for (var filename in response.files) {
				$("#filename").text(filename);
				var content = response.files[filename].content;
				$("#gisttext").val(content);
				$("#filename").closest("div.row").show();
				$("#gistresult").hide();
				break;
			}
		},
		datatype: "jsonp"
	});
}

function runGist()
{
    var content = $("#gisttext").val();
	gateway.postToService({RunScript : {code : content}},
		function(response) {
			$("#gistresult").show();
			$("#variables tbody").empty();
			var hasVars = response.Result.Variables && response.Result.Variables.length > 0;
			if (hasVars) {
				$.each(response.Result.Variables, function(idx, variable) {
					var el = $("<tr></tr>");
					var name = $("<td>").text(variable.Name);
					var value = $("<td>").text(variable.Value);
					var type = $("<td>").text(variable.Type);
					el.append(name).append(value).append(type);
					$("#variables tbody").append(el);
				});
			}

			$("#errors tbody").empty();
			var hasErrors = response.Result.Errors && response.Result.Errors.length > 0;
			if (hasErrors) {
				$.each(response.Result.Errors, function(idx, error) {
					var el = $("<tr></tr>").append(error.Info);
					$("#errors tbody").append(el);
				});
			}

			$("#variables").closest("div.row").toggle(hasVars);
			$("#errors").closest("div.row").toggle(hasErrors);

			console.log(response);
		},
		function(error) { alert(error); }
	);
}