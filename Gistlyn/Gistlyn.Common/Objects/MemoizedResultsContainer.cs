using System;
using System.Collections.Generic;

namespace Gistlyn.Common.Objects
{
    public class MemoizedResultsContainer
    {
        private object lockObj = new object();
        private Dictionary<string, MemoizedResult> memoizedResults = new Dictionary<string, MemoizedResult>();

        public Dictionary<string, MemoizedResult> MemoizedResults { get { return memoizedResults; } }

        public void AddOrUpdate(MemoizedResult result)
        {
            //TODO: limit memory usage in bytes and use LRU cache
            lock (lockObj)
            {
                if (memoizedResults.ContainsKey(result.CodeHash))
                    memoizedResults[result.CodeHash] = result;
                else
                    memoizedResults.Add(result.CodeHash, result);
            }
        }

        public MemoizedResult Get(string codeHash)
        {
            lock (lockObj)
            {
                if (memoizedResults.ContainsKey(codeHash))
                    return memoizedResults[codeHash];
                else
                    return null;
            }
        }
    }
}

