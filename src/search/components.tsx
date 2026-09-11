import type { 
    DataTableProps,
    TermSelectProps,
} from "./types"
import { useGet, useTerms } from "./utils";

// TODO should I turn hooks/components into a folder instead of a file?
// TODO what about testinggg
// TODO resource_links should be hrefs
function DataTable<T extends Record<string, string | number>>({
  data,
  loading,
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
// TODO also this is broken and selector doesnt populate until user
// changes selected endpoint at least once - global is broken?
function TermSelect({ terms, currentSelection, onChange }: TermSelectProps) {
  return (
    <select
      value={currentSelection ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
    >
      <option value="">None</option>
      {Object.entries(terms).map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
}

// TODO you are essentially forced to pick a term but you shouldn't need to
export function SyllabusSearch() {
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

// TODO currently, every endpoint looks just like this and accepts
// only these params. Fine for now
export function AssignmentsSearch() {
  // TODO having to maintain this list outside the backend it originates from
  // will become a mess. Openapi/swagger spec
  const allowed_sort_columns = ["course_id", "course_name", "id", "title"]

  const allowed_directions = ["asc", "desc"]

  const {
    params,
    setParams,
    data,
    loading,
    error,
    search,
  } = useGet(
    'search-assignments', 
    {
      course_name: '', 
      phrase: '', 
      term_id: null, 
      page: 1, 
      page_size: 20,
      sort_direction: '',
      sort_column: ''
    }
  );

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

      <select
        value={params.sort_direction}
        onChange={(e) =>
          setParams({
            ...params,
            sort_direction: e.target.value,
            page:1
          })
        }
      >
        <option value="">
          Sort Direction
        </option>
        {allowed_directions.map(a => (
          <option
            key = {a}
            value = {a}
          >
            {a}
          </option>
        ))}

      </select>

      <select
        value={params.sort_column}
        onChange={(e) =>
          setParams({
            ...params,
            sort_column: e.target.value,
            page:1
          })
        }
      >
        <option value="">
          Sort Column
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