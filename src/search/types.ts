// TODO have backend send an API spec that we can derive these from

type BaseParams = {
  page: number;
  page_size: number;
}

type SyllabusParams = BaseParams & {
  course_name: string;
  term_id: number;
  phrase: string;
}

type Syllabus = {
  course_id: number;
  name: string;
  resource_link: string;
}

type Pagination = {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

type Syllabi = {
  pagination: Pagination;
  results: Syllabus[];
}

type Terms = Record<string, string>

export type TermResponse = {
    terms: Terms
}

export type ApiEndpoints = {
  'search-syllabi': {
    params: SyllabusParams;
    response: Syllabi;
  };
  'terms': {
    params: undefined;
    response: TermResponse;
  }
}

export type UserFacingEndpoint = Exclude<keyof ApiEndpoints, 'terms'>;

export type DataTableProps<T extends Record<string, string | number>> = {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export type TermSelectProps = {
    terms: Record<string, string>;
    currentSelection: number;
    onChange: (termID:number) => void;
};