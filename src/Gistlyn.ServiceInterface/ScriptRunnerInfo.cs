// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;

namespace Gistlyn.ServiceInterface
{
    public class ScriptRunnerInfo : IDisposable
    {
        public string ScriptId { get; set; }

        public string SessionId { get; set; }

        public DateTime CreatedDate { get; set; }

        public DomainWrapper DomainWrapper { get; set; }

        public AppDomain ScriptDomain { get; set; }

        public void Dispose()
        {
            if (DomainWrapper != null)
                DomainWrapper.Cancel();

            if (ScriptDomain != null)
                AppDomain.Unload(ScriptDomain);
        }
    }
}

