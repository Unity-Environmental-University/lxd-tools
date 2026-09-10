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