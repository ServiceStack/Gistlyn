﻿using System;
using System.Collections.Generic;

namespace Gistlyn.Common.Objects
{
    [Serializable]
    public class JsIncludedScriptExecutionResult
    {
        public ScriptStatus Status { get; set; }

        public List<ErrorInfo> Errors { get; set; }

        public Exception Exception { get; set; }

        public ScriptVariableJson LastVariableJson { get; set; }
    }
}

