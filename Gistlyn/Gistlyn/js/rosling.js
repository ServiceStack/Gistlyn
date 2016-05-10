//common functions
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

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function isParameterInQuery(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match;
}

function getQueryHash() {
    return window.location.hash == "#" ? "" : window.location.hash;
}

//gistlyn-based functions

function init()
{
    var gistHash = getParameterByName("gist");

    if (gistHash) {
        $("#gistId").val(gistHash);
        getGist();
    }

    $("#multirun").removeAttr("disabled");
    $("#cancel").hide();

    var source = new EventSource('/servicestack/event-stream?channels=@channels&t=' + new Date().getTime()); //disable cache
    source.addEventListener('error', function (e) {
        console.log(e);
        //addEntry({ msg: "ERROR!", cls: "error" });
    }, false);

    $(source).handleServerEvents({
        handlers: {
            onConnect: function (u) {
                console.log(u);
                activeSub = u;
            },
            onHeartbeat: function (msg, e) { if (console) console.log("onHeartbeat", msg, e); },
            onJoin: refreshUsers,
            onLeave: refreshUsers,
            chat: function (m, e) {
                addEntry({ id: m.id, userId: m.fromUserId, userName: m.fromName, msg: m.message, cls: m.private ? ' private' : '', channel: m.channel || e.channel });
            },
            helloResponse: function(m, e) {
                console.log(m);
            },
            ConsoleMessage: function(m, e) {
                console.log("console out", m);
                $("#multirunBlock").show();
                $("#multirunBlock .role-gistresult").show();
                var consoleOut = $("#multirunBlock textarea.role-console");
                $(consoleOut).show();
                $(consoleOut).val(consoleOut.val() + m.message);
            },
            stopListening: function () { $.ss.eventSource.close(); }
        },
        receivers: {
            tv: {
                watch: function (id) {
                    console.log("watch id=",id);
                },
                off: function () {
                    console.log("off");
                }
            }
        }
    });

}

function refreshUsers()
{
    console.log("refresh users");
}

function bind()
{
	$("#load").click(getGist);

    $("#multirun").click(runMultiple);

    $("#cancel").click(cancelScript);

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
                {SearchNugetPackages: {search : query}},
                function(response){callback(response.packages);},
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
                {SearchInstalledPackages: {search : query}},
                function(response){callback(response.packages);},
                showError
            );
        },
        afterSelect: function(value) {
            $("#addReference").show();
        }
    });


    $("#install").click(installPackage);

    $("#addReference").click(addReference);

    $("#multirunBlock button.role-getvariables").click(getVariables);

    $("#multirunBlock").on("click", "button.role-getVariableJson", getVariableJson);

    $("#multirunBlock").on("click", "button.role-inspectVariable", inspectVariable);
}

function getGist()
{
	var gistId = $("#gistId").val();

	$.get({
		url: "https://api.github.com/gists/" + gistId,
		success: function(response) {
            $("#gistId").data("gistHash", gistId);
            //clear run multiple
            $("#multirunBlock").hide();
            $("#multirunBlock table.role-variables tbody").empty();
            $("#multirunBlock table.role-errors tbody").empty();
            $("#multirunBlock span.role-exception").closest("div.row").hide();
            //show "multirun" button
            $("#multirun").toggle(Object.keys(response.files).length > 0);

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

    if (response.result.parentVariable) {
        $(".role-parentVariable", $block).data("prev", $(".role-parentVariable", $block).text());
        $(".role-parentVariable", $block).text(response.result.parentVariable.name);
        $(".role-getvariables", $block).text("Back");
    } else {
        $(".role-getvariables", $block).text("Get Variables");
        $(".role-parentVariable", $block).data("prev", "");
        $(".role-parentVariable", $block).text("");
    }

    var hasVars = response.result.variables && response.result.variables.length > 0;
    if (hasVars) {
        $.each(response.result.variables, function(idx, variable) {
            var el = $("<tr></tr>");
            var name = $('<td class="role-name"></td>').text(variable.name);
            var value = $('<td class="role-value"></td>').text(variable.value);
            var type = $('<td class="role-type"></td>').text(variable.type);
            var btnJson = $('<td><button class="btn btn-primary role-getVariableJson">Get Json</button></td>');
            var btnInspect = variable.isBrowseable ? $('<td><button class="btn btn-primary role-inspectVariable">Inspect</button></td>') : $('<td></td>');
            el.append(name).append(value).append(type).append(btnInspect).append(btnJson);
            $("table.role-variables tbody", $block).append(el);
        });
    }
    $("table.role-variables tbody", $block).closest("div.row").toggle(hasVars);

    $("table.role-errors tbody", $block).empty();
    var hasErrors = response.result.errors && response.result.errors.length > 0;
    if (hasErrors) {
        $.each(response.result.errors, function(idx, error) {
            var el = $("<tr></tr>").append(error.info);
            $("table.role-errors tbody", $block).append(el);
        });
    }
    $("table.role-errors tbody", $block).closest("div.row").toggle(hasErrors);

    var hasException = !!response.result.exception;
    if (hasException) {
        $("span.role-exception").text(response.result.exception);
    }
    $("span.role-exception", $block).closest("div.row").toggle(hasException);

    //$("textarea.role-console", $block).val(response.Result.Console);
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

    var gistHash = $("#gistId").data("gist");
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

    var empty = {result : { variables: [], errors: [], console: ""}};
    scriptExecResponse($("#multirunBlock"), empty);
    $("#multirunBlock textarea.role-console").val(empty.result.console);

    $("#multirunBlock").show();
    $("#multirunBlock .role-gistresult").show();
    $("#multirun").attr("disabled", "disabled");
    $("#cancel").show();

    gateway.postToService({RunMultipleScripts : {gistHash: gistHash, mainCode : mainCode, scripts: sources, references: references, packages: packages}},
        function(response) {
            scriptExecResponse($("#multirunBlock"), response);
            $("#multirunBlock").show();

            $("#assemblyReferences ul").empty();
            var template = Handlebars.compile( $("#references-template").html() );
            console.log(template({ references: response.references }));
            $("#assemblyReferences ul").append( template({ references: response.references }) );
        },
        function(e) {
            $("#multirun").removeAttr("disabled");
            showError(e);
        }
    );
}

function cancelScript()
{
    var gistHash = $("#gistId").data("gist");

    gateway.postToService({CancelScript : {gistHash: gistHash}},
        function(response) {
            $("#multirun").removeAttr("disabled");
            $("#cancel").hide();
        },
        showError
    );

}

function installPackage()
{
    var package = $("#packages").typeahead("getActive");

    gateway.postToService({InstallNugetPackage: { packageId: package.id, version: package.version, ver: package.ver}},
        function(response) {
            alert("installed");
        },
        showError
    );
}

function addReference()
{
    var package = $("#installedPackages").typeahead("getActive");

    gateway.postToService({AddPackageAsReference: { packageId: package.id, version: package.ver}},
        function(response) {
            var references = $("#assemblyReferences").data("references");
            if (!references) references = [];

            $.each(response.assemblies, function(idx,val){
                if ($.grep(references, function(val2) { return val2.name == val.name}).length == 0)
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

function getVariables()
{
    var gistHash = $("#gistId").data("gist");
    var parent = $("#multirunBlock .role-parentVariable").data("prev");

    gateway.getFromService({GetScriptVariables : {gistHash: gistHash, variableName: parent}},
        function(response) {
            if (response.status == "PrepareToRun" || response.status == "Running")
                $("#multirunBlock span.role-runningState").text("Script is running can't get variables");
            else 
                $("#multirunBlock span.role-runningState").text("");

            scriptExecResponse($("#multirunBlock"), { result: { variables: response.variables, errors: {}, exceptions: {}}});
        },
        showError
   );
}

function getVariableJson(e)
{
    var $that = $(this);
    var name = $("td.role-name", $that.closest("tr")).text();
    var gistHash = $("#gistId").data("gist");

    gateway.getFromService({GetScriptVariableJson : {gistHash: gistHash, variableName: name}},
        function(response) {
            if (response.status == "PrepareToRun" || response.status == "Running")
                $("#multirunBlock span.role-runningState").text("Script is running. Can't get variable json representation");
            else 
                $("#multirunBlock span.role-runningState").text("");

            console.log(response);

            if (response.json) {
                var $next=$that.closest("tr").next();
                if ($next.hasClass("role-json")) {
                    $("td", $next).text(response.json);
                } else {
                    var td = $('<td colspan="4"></td>').text(response.json);
                    var tr = $('<tr class="role-json"></tr>').append(td);
                    $that.closest("tr").after(tr);
                }
            }
        },
        showError
   );
}

function inspectVariable(e)
{
    var $that = $(this);
    var parentName = $("#multirunBlock .role-parentVariable").text();
    var name = $("td.role-name", $that.closest("tr")).text();
    var gistHash = $("#gistId").data("gist");
    var variableName = parentName ? parentName + '.' + name : name;

    gateway.getFromService({GetScriptVariables: { gistHash: gistHash, variableName: variableName }},
        function(response) {
            if (response.status == "PrepareToRun" || response.status == "Running")
                $("#multirunBlock span.role-runningState").text("Script is running can't get variables");
            else 
                $("#multirunBlock span.role-runningState").text("");

            scriptExecResponse($("#multirunBlock"), { result: { parentVariable: response.parentVariable, variables: response.variables, errors: {}, exceptions: {}}});
        },
        showError
    );
}