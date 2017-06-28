﻿// Copyright (c) Service Stack LLC. All Rights Reserved.
// License: https://raw.github.com/ServiceStack/ServiceStack/master/license.txt

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.IO;
using Microsoft.CodeAnalysis;

namespace Gistlyn.SnippetEngine
{
    public class GistSourceResolver : SourceReferenceResolver
    {
        public string baseDirectory;
        private readonly ImmutableArray<string> searchPaths;
        private readonly ImmutableArray<KeyValuePair<string, string>> pathMap;
        private readonly Dictionary<string, string> scripts = new Dictionary<string, string>();

        public Dictionary<string, string> Scripts => scripts;

        public GistSourceResolver(List<string> scripts)
        {
            int i = 1;
            foreach (var script in scripts)
            {
                this.scripts.Add(i.ToString(), script);
                i++;
            }
        }

        public override string NormalizePath(string path, string baseFilePath)
        {
            return path;
        }

        public override Stream OpenRead(string resolvedPath)
        {
            var code = scripts[resolvedPath];
            var stream = new MemoryStream(System.Text.Encoding.ASCII.GetBytes(code));
            return stream;
        }

        public override string ResolveReference(string path, string baseFilePath)
        {
            return path;
        }

        public override bool Equals(object obj)
        {
            // Explicitly check that we're not comparing against a derived type
            if (obj == null || GetType() != obj.GetType())
                return false;

            return Equals((GistSourceResolver)obj);
        }

        public bool Equals(GistSourceResolver other)
        {
            return
                string.Equals(baseDirectory, other.baseDirectory, StringComparison.Ordinal) &&
                      scripts.Equals(other.scripts);
        }

        public override int GetHashCode()
        {
            return baseDirectory.GetHashCode() ^ scripts.GetHashCode();
        }
    }
}

