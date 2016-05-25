var gistScripts;

function getGist(gistId, scriptId, onSuccess)
{
    $.get({
        url: "https://api.github.com/gists/" + gistId,
        success: function(response) {
            var main;
            var scripts = [];
            var packages;

            $.each(response.files, function(idx, file) { 
                if (file.filename.toUpperCase() == "MAIN.CS") {
                    main = file.content;
                } else if (file.filename.toUpperCase() == "PACKAGES.CONFIG") {
                    packages = file.content;
                } else {
                    scripts.push(content);
                }
            });

            onSuccess({scriptId: scriptId, gistHash: gistId, mainCode: main, scripts: scripts, packages: packages});
        },
        datatype: "jsonp"
    });
}

function onGistResponse(response)
{
    //TODO: change to getElementById
    $("#main_" + response.scriptId).val(response.mainCode);

    gistScripts["script_" + scriptId] = response;
}

function runScript(scriptId)
{
    var mainCode = $("#main_" + scriptId).val();
    var scriptInfo = gistScripts["script_" + scriptId];

    gateway.postToService({RunMultipleScripts : {gistHash: scriptInfo.gistHash, mainCode : scriptInfo.mainCode, scripts: scriptInfo.scripts, packages: scriptInfo.packages, forceRun: true}},
        function(response) {
            //TODO: disable run, enable cancel
        },
        function(e) {
            //disable canlel, enable run
            //showError(e);
        }
    );

}

function cancelScript(scriptId)
{
    var gistHash = scriptId;

    gateway.postToService({CancelScript : {gistHash: gistHash}},
        function(response) {
            //$("#multirun").removeAttr("disabled");
            //$("#cancel").hide();
            //$("#scriptStatus").text(response.result.status);
        },
        showError
    );
}

function subscribeServerEvents(channel)
{
    var source = new EventSource('/servicestack/event-stream?channels=' + channel + '&t=' + new Date().getTime()); //disable cache
    source.addEventListener('error', function (e) {
        console.log(e);
        //addEntry({ msg: "ERROR!", cls: "error" });
    }, false);

    $(source).handleServerEvents({
        handlers: {
            onConnect: function (u) {
                console.log("subscription", u);
                activeSub = u;
            },
            onHeartbeat: function (msg, e) { if (console) console.log("onHeartbeat", msg, e); },
            onJoin: refreshUsers,
            onLeave: refreshUsers,
            ConsoleMessage: function(m, e) {
                console.log("console out", m);
            },
            ScriptExecutionResult: function(m, e) {
                //$("#scriptStatus").text(m.status);
                //scriptExecResponse($("#multirunBlock"), {result : m});
                switch(m.status) {
                    case "Completed":
                    case "Cancelled":
                    case "CompiledWithErrors":
                    case "ThrowedException":
                        //$("#multirun").removeAttr("disabled");
                        //$("#cancel").hide();
                        break;
                }

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
