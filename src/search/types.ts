// LISA's request and response shapes, derived from its OpenAPI spec.
// lisa-api/schema.d.ts is generated from the committed lisa-api/openapi.json
// snapshot (npm run gen:lisa-api); update the snapshot with npm run sync:lisa-api.
import type {components, paths} from './lisa-api/schema';

type Get<P extends keyof paths> = paths[P]['get'];

/** Query params of a LISA GET endpoint */
export type Query<P extends keyof paths> = NonNullable<Get<P>['parameters']['query']>;

/** 200 response body of a LISA GET endpoint */
export type Ok<P extends keyof paths> =
  Get<P>['responses'][200]['content']['application/json'];

/** Every /api/search-* path in LISA's spec */
export type SearchPath = Extract<keyof paths, `/api/search-${string}`>;

export type SearchParams<P extends SearchPath = SearchPath> = Query<P>;
export type SearchResponse<P extends SearchPath = SearchPath> = Ok<P>;
export type SearchRow<P extends SearchPath = SearchPath> = SearchResponse<P>['results'][number];
export type SortColumn<P extends SearchPath = SearchPath> = NonNullable<SearchParams<P>['sort_column']>;
export type SortDirection = NonNullable<SearchParams['sort_direction']>;

/** The search form's state. Every search takes the same params, except that
 * each has its own sort_column enum; the form only offers the selected
 * endpoint's columns (sortColumns) */
export type SearchForm = Omit<SearchParams, 'sort_column'> & {sort_column?: SortColumn};

export type Term = components['schemas']['Term'];

export type DataTableProps<T extends SearchRow> = {
  data: T[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export type TermSelectProps = {
  terms: Term[];
  currentSelection: number | undefined;
  onChange: (termID: number | undefined) => void;
};
