using System;
using System.Collections.Generic;

namespace Gistlyn.Common.Objects
{
    public class MemoizedResultsContainer
    {
        private readonly object lockObj = new object();
        public readonly Dictionary<string, MemoizedResult> MemoizedResults = new Dictionary<string, MemoizedResult>();

        public void AddOrUpdate(MemoizedResult result)
        {
            //TODO: limit memory usage in bytes and use LRU cache
            lock (lockObj)
            {
                if (MemoizedResults.ContainsKey(result.CodeHash))
                    MemoizedResults[result.CodeHash] = result;
                else
                    MemoizedResults.Add(result.CodeHash, result);
            }
        }

        public MemoizedResult Get(string codeHash)
        {
            lock (lockObj)
            {
                return MemoizedResults.ContainsKey(codeHash) 
                    ? MemoizedResults[codeHash] 
                    : null;
            }
        }
    }
}

