﻿function showError(status)
{
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: "Error",
        message: status.responseStatus.message,
        buttons: [{
            label: 'Close',
            action: function(dialog) {
                dialog.close();
            }
        }]
    });
}

function bind()
{
	$("#load").click(getGist);

    $("#multirun").click(runMultiple);

    $("#gistlist").on("click", "button.role-run", function(e){
        runGist($(e.target).closest("div.role-execblock"));
        //console.log($("textarea", $(e.target).closest("div.row")).val());
    });

    $("#packages").typeahead({
        minLength: 0,
        delay: 800,
        showHintOnFocus: false,
        displayText: function(val) { return val.Id + " [" + val.Ver + "]"; },
        items: "all",
        source: function(query, callback) {
            $("#install").hide();
            gateway.getFromService(
                {SearchNugetPackages: {Search : query}},
                function(response){callback(response.Packages);},
                showError
            );
        },
        afterSelect: function(value) {
            $("#install").show();
        }
    });

    $("#installedPackages").typeahead({
        minLength: 0,
        delay: 200,
        showHintOnFocus: false,
        displayText: function(val) { return val.Id + " [" + val.Ver + "]"; },
        items: "all",
        source: function(query, callback) {
            $("#addReference").hide();
            gateway.getFromService(
                {SearchInstalledPackages: {Search : query}},
                function(response){callback(response.Packages);},
                showError
            );
        },
        afterSelect: function(value) {
            $("#addReference").show();
        }
    });


    $("#install").click(installPackage);

    $("#addReference").click(addReference);
}

function getGist()
{
	var gistId = $("#gistId").val();

	$.get({
		url: "https://api.github.com/gists/" + gistId,
		success: function(response) {
            //clear run multiple
            $("#multirunBlock").hide();
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
        showError
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
    $("table.role-variables tbody", $block).closest("div.row").toggle(hasVars);

    $("table.role-errors tbody", $block).empty();
    var hasErrors = response.Result.Errors && response.Result.Errors.length > 0;
    if (hasErrors) {
        $.each(response.Result.Errors, function(idx, error) {
            var el = $("<tr></tr>").append(error.Info);
            $("table.role-errors tbody", $block).append(el);
        });
    }
    $("table.role-errors tbody", $block).closest("div.row").toggle(hasErrors);

    var hasException = !!response.Result.Exception;
    if (hasException) {
        $("span.role-exception").text(response.Result.Exception);
    }
    $("span.role-exception", $block).closest("div.row").toggle(hasException);

    $("textarea.role-console", $block).val(response.Result.Console);
}

function runMultiple()
{
    var filenames = $("#gistlist .role-filename").text();
    var main = $.grep($("#gistlist .role-filename"), function(val){ return $(val).text().toUpperCase() == "MAIN.CS" });
    var packagesConfig = $.grep($("#gistlist .role-filename"), function(val){ return $(val).text().toUpperCase() == "PACKAGES.CONFIG" });

    if (main.length != 1) {
        showError({responseStatus : {message: "There must be at file 'Main.cs' and it must be only one"}});
    }

    if (packagesConfig.length > 1) {
        showError({responseStatus : {message: "There must be only one file 'packages.config'"}});
    }

    var mainCode = $("textarea", $(main[0]).closest("div.row")).val();
    var sources = [];
    var references = $("#assemblyReferences").data("references");
    var packages = packagesConfig.length > 0 ? $("textarea", $(packagesConfig[0]).closest("div.row")).val() : null;

    $.each($("#gistlist .role-execblock"), function(idx, val) {
        var filename = $(".role-filename", $(val)).text().toUpperCase();
        if (filename != "MAIN.CS" && filename != "PACKAGES.CONFIG" ) {
            sources.push($("textarea",$(val)).val());
        }
    });

    gateway.postToService({RunMultipleScripts : {mainCode : mainCode, scripts: sources, references: references, packages: packages}},
        function(response) {
            $("consoleOut").val(response.Console);
            scriptExecResponse($("#multirunBlock"), response);
            $("#multirunBlock").show();

            $("#assemblyReferences ul").empty();
            var template = Handlebars.compile( $("#references-template").html() );
            console.log(template({ references: response.References }));
            $("#assemblyReferences ul").append( template({ references: response.References }) );
        },
        showError
    );
}

function installPackage()
{
    var package = $("#packages").typeahead("getActive");

    gateway.postToService({InstallNugetPackage: { PackageId: package.Id, Version: package.Version, Ver: package.Ver}},
        function(response) {
            alert("installed");
        },
        showError
    );
}

function addReference()
{
    var package = $("#installedPackages").typeahead("getActive");

    gateway.postToService({AddPackageAsReference: { PackageId: package.Id, Version: package.Ver}},
        function(response) {
            var references = $("#assemblyReferences").data("references");
            if (!references) references = [];

            $.each(response.Assemblies, function(idx,val){
                if ($.grep(references, function(val2) { return val2.Name == val.Name}).length == 0)
                    references.push(val);
            });
            $("#assemblyReferences").data("references", references);

            $("#assemblyReferences ul").empty();
            var template = Handlebars.compile( $("#references-template").html() );
            console.log(template({ references: references }));
            $("#assemblyReferences ul").append( template({ references: references }) );
        },
        showError
    );
}
