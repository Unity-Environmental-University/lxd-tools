import { useEffect } from "react";
import type {
    DataTableProps,
    SearchPath,
    SearchRow,
    SortColumn,
    SortDirection,
    TermSelectProps,
} from "./types"
import { cellText, sortColumns, useSearch, useTerms } from "./utils";
import "./search.css"

const ALLOWED_DIRECTIONS: SortDirection[] = ["asc", "desc"]

// TODO should I turn hooks/components into a folder instead of a file?
function DataTable<T extends SearchRow>({
  data,
  loading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: DataTableProps<T>) {
  if (data.length === 0) return <p>No data</p>;

  const columns = Object.keys(data[0]) as (keyof T & string)[];

  return (
    <>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col}>
                  {col === "resource_link" ? <a href={row.resource_link} target="_blank" rel="noopener noreferrer">{row.resource_link}</a> : cellText(col, row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={loading || currentPage <= 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}. [{totalCount} total results]
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={loading || currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
}

// TODO this function is kind of copy-pasted from LISA itself
// which raises the question of a re-usable library
function TermSelect({ terms, currentSelection, onChange }: TermSelectProps) {
  return (
    <select
      value={currentSelection ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? undefined : Number(e.target.value))
      }
    >
      <option value="">All Terms</option>
      {(terms).map((term) => (
        <option key={term.id} value={term.id}>
          {term.name ?? `Term ${term.id}`}
        </option>
      ))}
    </select>
  );
}

// currently this works for everything because the endpoints are simple
export function GenericSearch({endpoint}: {endpoint: SearchPath}) {
  const {
    params,
    setParams,
    data,
    loading,
    error,
    search,
  } = useSearch(
    endpoint,
    {
      course_name: '',
      phrase: '',
      page: 1,
      page_size: 20,
    }
  );
  const allowed_sort_columns = sortColumns(endpoint);

  // the previous endpoint's sort column may not exist on this one
  useEffect(() => {
    setParams(p => ({...p, sort_column: undefined}));
  }, [endpoint, setParams]);

  const {terms, error:_err} = useTerms()

  return (
    <div>
      <input
        value={params.course_name}
        placeholder="input course name (optional)"
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

      <select
        value={params.sort_direction ?? ""}
        onChange={(e) =>
          setParams({
            ...params,
            sort_direction: e.target.value === "" ? undefined : e.target.value as SortDirection,
            page:1
          })
        }
      >
        <option value="">
          Default Sort Direction
        </option>
        {ALLOWED_DIRECTIONS.map(a => (
          <option
            key = {a}
            value = {a}
          >
            {a}
          </option>
        ))}

      </select>

      <select
        value={params.sort_column ?? ""}
        onChange={(e) =>
          setParams({
            ...params,
            sort_column: e.target.value === "" ? undefined : e.target.value as SortColumn,
            page:1
          })
        }
      >
        <option value="">
          Default Sort Column
        </option>
        {allowed_sort_columns.map(a => (
          <option
            key = {a}
            value = {a}
          >
            {a}
          </option>
        ))}

      </select>

      <button onClick={() => search()} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && <p>{error.message}</p>}

      {data ?
        <DataTable
          data={data.results}
          loading={loading}
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
