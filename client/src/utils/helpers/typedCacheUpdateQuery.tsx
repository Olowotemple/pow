import { Cache, QueryInput } from '@urql/exchange-graphcache';

function typedCacheUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  result: any,
  fn: (result: Result, query: Query) => Query
) {
  return cache.updateQuery(
    queryInput,
    (data) => fn(result, data as any) as any
  );
}

export default typedCacheUpdateQuery;
