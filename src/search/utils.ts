import { useState, useEffect } from "react";
import type { 
    TermResponse,
    ApiEndpoints,
    UserFacingEndpoint
} from "./types"

let termsPromise: Promise<TermResponse> | null = null;

// only fetch terms if promise is null (hasn't been fetched yet)
function getTerms() {
  if (!termsPromise) {
    termsPromise = get<'terms'>('terms').catch(error => {
      // Clear the cache on failure so a retry can happen later
      termsPromise = null; 
      throw error;
    });
  }
  return termsPromise;
}

// fetch terms again if we dont have it
// re-usable in components that need the list of terms
export function useTerms() {
  const [terms, setTerms] = useState<Record<string, string>>({});
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    function attemptLoad() {
      getTerms()
        .then(response => {
          if (!cancelled) setTerms(response.terms);
        })
        .catch(err => {
          attempt += 1;
          if (attempt < 3 && !cancelled) {
            setTimeout(attemptLoad, 1000 * attempt); // 1s, 2s backoff
          } else if (!cancelled) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
          }
        });
    }

    attemptLoad();
    //cancelled is to prevent setting terms if a component that calls useTerms unmounts
    //before fetch resolves
    return () => { cancelled = true; };
  }, []);

  return { terms, error };
}

async function get<K extends keyof ApiEndpoints>(
  slug: string,
  params?: ApiEndpoints[K]['params']
): Promise<ApiEndpoints[K]['response']> {
  

  const BASE = 'https://lisa/beta/api';
  const url = new URL(`${BASE}/${slug}`);

  if(params){
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
        }
    }
  }

  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) {
    let message = `${res.status}`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // body wasn't JSON (e.g. a 502)
    }
    throw new Error(`Failed to fetch ${slug}: ${message}`);
  }

  return await res.json();
}

export function useGet<K extends UserFacingEndpoint>(endpoint: string, initial_params: ApiEndpoints[K]['params']) {
  const [params, setParams] = useState<ApiEndpoints[K]['params']>(initial_params);
  const [data, setData] = useState<ApiEndpoints[K]['response'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function search(searchParams = params) {
    setLoading(true);
    setError(null);

    try {
      const result = await get(endpoint, searchParams);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return {
    params,
    setParams,
    data,
    loading,
    error,
    search,
  };
}