function init_{0} () {{
    var scriptId = "{0}";
    var gist = "{1}";
    var noCache = {2};
    var url = "{3}";

    getGist(gist, scriptId, onGistResponse);

    $("#run_{0}").click(function() {{ runScript(url, scriptId, noCache); }});

    $("#cancel_{0}").click(function() {{ cancelScript(url, scriptId); }});

    var editor = CodeMirror.fromTextArea(document.getElementById("main_{0}"), {{
        lineNumbers: true,
        mode: "text/x-csharp",
        theme: "default",
        indentUnit: 4
    }});

    codeMirrorEditors["{0}"] = editor;
}}
