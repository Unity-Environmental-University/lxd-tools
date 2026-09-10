import { useState, useEffect } from "react";

type BaseParams = {
  page: number;
  page_size: number;
}

type SyllabusParams = BaseParams & {
  course_name: string;
  term_id: number;
  phrase: string;
}

type paramType = Record<string, string | number | boolean | null | undefined>

type syllabus = {
  course_id: number;
  name: string;
  resource_link: string;
}

type pagination = {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

type Syllabi = {
  pagination: pagination;
  results: syllabus[];
}

type Terms = Record<string, string>

type TermResponse = {
    terms: Terms
}

type ApiEndpoints = {
  'search-syllabi': {
    params: SyllabusParams;
    response: Syllabi;
  };
  'terms': {
    params: undefined;
    response: TermResponse;
  }
}

const BASE = 'https://lisa/beta/api';

async function get<K extends keyof ApiEndpoints>(
  slug: K,
  params?: ApiEndpoints[K]['params']
): Promise<ApiEndpoints[K]['response']> {
  
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

function useGet<K extends keyof ApiEndpoints>(endpoint: K, initial_params: ApiEndpoints[K]['params']) {
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

type DataTableProps<T extends Record<string, string | number>> = {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

// TODO I need pagination controls here
function DataTable<T extends Record<string, string | number>>({
  data,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: DataTableProps<T>) {
  if (data.length === 0) return <p>No data</p>;

  const columns = Object.keys(data[0]) as (keyof T)[];

  return (
    <>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col)}>{String(col)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={String(col)}>
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}. [{totalCount} total results]
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
}

type TermSelectProps = {
    terms: Record<string, string>;
    currentSelection: number;
    onChange: (termID:number) => void;
};

// TODO this function is copy-pasted from LISA itself
// which raises the question of a re-usable library
function TermSelect({terms, currentSelection, onChange}: TermSelectProps){
    return(
        <select
            value = {currentSelection}
            onChange = {e => onChange(Number(e.target.value))}
        >
            {Object.entries(terms).map(([id, name]) => (
                <option 
                    key = {id}
                    value = {id}
                >{name}</option>
            ))}
        </select>
    );
}

let termsPromise: Promise<TermResponse> | null = null;

// only fetch terms if promise is null (hasn't been fetched yet)
function getTerms() {
  if (!termsPromise) {
    termsPromise = get('terms').catch(error => {
      // Clear the cache on failure so a retry can happen later
      termsPromise = null; 
      throw error;
    });
  }
  return termsPromise;
}

// fetch terms again if we dont have it
// re-usable in components that need the list of terms
function useTerms() {
  const [terms, setTerms] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log("ahaha")
    getTerms().then(response => {
      setTerms(response.terms);
    })
    .catch(err => {
        console.error("Failed to load terms:", err);
    });
  }, []);

  return terms;
}

function SyllabusSearch() {
  const {
    params,
    setParams,
    data,
    loading,
    error,
    search,
  } = useGet('search-syllabi', {course_name: '', phrase: '', term_id: 0, page: 1, page_size: 20});

  const terms = useTerms()

  return (
    <div>
      <input
        value={params.course_name}
        placeholder="input course name"
        onChange={(e) =>
          setParams({
            ...params,
            course_name: e.target.value,
            page: 1
          })
        }
      />

      <input
        value={params.phrase}
        placeholder="input search phrase"
        onChange={(e) =>
          setParams({
            ...params,
            phrase: e.target.value,
            page: 1
          })
        }
      />

      <TermSelect
        terms={terms}
        currentSelection={params.term_id}
        onChange={(e) =>
            setParams({
                ...params,
                term_id: e,
                page: 1
            })
        }
      />

      <button onClick={() => search()} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && <p>{error.message}</p>}

      {data ?
        <DataTable
          data={data.results}
          currentPage={data.pagination.page}
          totalPages={data.pagination.total_pages}
          totalCount={data.pagination.total_count}
          onPageChange={(page) => {
            const newParams = {
                ...params,
                page,
            };
            setParams(newParams);
            search(newParams);
          }}
        />
        : <p>No data</p>
      }
    </div>
  );
}

const endpoints = {
  'search-syllabi': 'Search Syllabi',
  'terms': 'Terms',
} as const;

export function SearchApp() {
  const [endpoint, setEndpoint] = useState<keyof ApiEndpoints | "">("");
  return (
    <div className="ResultsApp container">
      <select value={endpoint} onChange={(e) => setEndpoint(e.target.value as keyof ApiEndpoints)}>
        <option value="">Pick endpoint</option>
        {Object.entries(endpoints).map(([value, label]) => (
            <option key={value} value={value}>
                {label}
            </option>
        ))}
      </select>
      {endpoint === "search-syllabi" && <SyllabusSearch />}
    </div>
  );
}