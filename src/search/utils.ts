import { useState, useEffect } from "react";
import { Temporal } from "temporal-polyfill";
import type { paths } from "./lisa-api/schema";
import spec from "./lisa-api/openapi.json";
import type {
    Ok,
    Query,
    SearchForm,
    SearchParams,
    SearchPath,
    SearchResponse,
    SortColumn,
    Term,
} from "./types"

let termsPromise: Promise<Term[]> | null = null;
export const BASES = {
  prod: "https://lisa.campus.unity.edu",
  ce: "https://lisa.campus.unity.edu/ce",
} as const;
export type BaseKey = keyof typeof BASES;

let currentBase: string = BASES.prod;
export const getBase = () => currentBase;

// switching servers invalidates the cached terms, since they come from the old server
export function setBase(key: BaseKey) {
  if (currentBase === BASES[key]) return;
  currentBase = BASES[key];
  termsPromise = null;
}

type SpecParam = {name: string; schema: {enum?: string[]}};
const specPaths = spec.paths as Record<string, {get: {parameters?: SpecParam[]}}>;

// the columns LISA lets a search sort by, read from the spec
export function sortColumns<P extends SearchPath>(path: P): SortColumn<P>[] {
  const param = specPaths[path].get.parameters?.find(p => p.name === "sort_column");
  return (param?.schema.enum ?? []) as SortColumn<P>[];
}

// LISA's search timestamps are its *_at columns (format: date-time in the
// spec), sent as ISO 8601 in UTC with microseconds: 2026-11-13T14:00:00.123456Z.
// Temporal parses that in every browser; Date only has to accept 3 digits
export function isTimestampColumn(column: string) {
  return column.endsWith("_at");
}

// a timestamp in the viewer's time zone, e.g. "Nov 13, 2026, 9:00 AM".
// Anything that isn't an ISO instant is returned unchanged
export function formatTimestamp(value: string, timeZone?: string) {
  try {
    return Temporal.Instant.from(value).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    });
  } catch {
    return value;
  }
}

// the text of one search result cell
export function cellText(column: string, value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" && isTimestampColumn(column)) return formatTimestamp(value);
  return String(value);
}

// only fetch terms if promise is null (hasn't been fetched yet)
function getTerms() {
  if (!termsPromise) {
    termsPromise = get('/api/terms').catch(error => {
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
  const [terms, setTerms] = useState<Term[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    function attemptLoad() {
      getTerms()
        .then(response => {
          if (!cancelled) setTerms(response);
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

async function get<P extends keyof paths>(
  path: P,
  params?: Query<P>
): Promise<Ok<P>> {
  const url = new URL(`${currentBase}${path}`);

  if(params){
    for (const [key, value] of Object.entries(params)) {
      // array params (e.g. course_ids) repeat the key for each value
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item !== undefined && item !== null && item !== "") {
          url.searchParams.append(key, String(item));
        }
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
    throw new Error(`Failed to fetch ${path}: ${message}`);
  }

  return await res.json();
}

export function useSearch(endpoint: SearchPath, initial_params: SearchForm) {
  const [params, setParams] = useState<SearchForm>(initial_params);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function search(searchParams = params) {
    setLoading(true);
    setError(null);

    try {
      // sort_column is one of this endpoint's columns: the form only offers those
      const result = await get(endpoint, searchParams as SearchParams);
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
