// TODO have backend send an API spec that we can derive these from

type BaseParams = {
  page: number;
  page_size: number;
}

type SortBaseParams = BaseParams & {
    sort_column: string;
    sort_direction: string;
}

type SyllabusParams = BaseParams & {
  course_name: string;
  term_id: number | null;
  phrase: string;
}

// TODO create a base object that has id and resource link

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

type Assignment = {
  assignment_id: number;
  course_id: number;
  course_name: string;
  resource_link: string;
  title: string;
};

type Assignments = {
    pagination: Pagination;
    results: Assignment[]
}

type AssignmentParams = SortBaseParams & {
    course_name: string;
    term_id: number | null;
    phrase: string;
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
  'search-assignments': {
    params: AssignmentParams;
    response: Assignments;
  }
}

export type UserFacingEndpoint = Exclude<keyof ApiEndpoints, 'terms'>;

export type DataTableProps<T extends Record<string, string | number>> = {
  data: T[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export type TermSelectProps = {
    terms: Record<string, string>;
    currentSelection: number | null;
    onChange: (termID:number|null) => void;
};