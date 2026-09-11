import { useState } from "react";
import type { 
    UserFacingEndpoint
} from "./types"
import { SyllabusSearch, AssignmentsSearch } from "./components";

const ENDPOINT_CONFIG = {
  'search-syllabi': { label: 'Search Syllabi', Component: SyllabusSearch },
  'search-assignments': { label: 'Assignments', Component: AssignmentsSearch },
//   'search-pages': { label: 'Pages', Component: PageSearch },
//   'search-topics': { label: 'Discussion Topics', Component: TopicSearch },
//   'search-topic-replies': { label: 'Discussion Entries', Component: TopicReplySearch },
//   'search-filenames': { label: 'Filenames', Component: FilenameSearch },
//   'search-quizzes': { label: 'Quizzes', Component: QuizSearch },
//   'search-questions': { label: 'Quiz Questions', Component: QuestionSearch },
} satisfies Record<UserFacingEndpoint, { label: string; Component: React.ComponentType}>

export function SearchApp() {
  const [endpoint, setEndpoint] = useState<UserFacingEndpoint | "">("");
  const component = endpoint ? ENDPOINT_CONFIG[endpoint] : null

  return (
    <div className="ResultsApp container">
      <select value={endpoint} onChange={(e) => setEndpoint(e.target.value as UserFacingEndpoint)}>
        <option value="">Pick endpoint</option>
        {Object.entries(ENDPOINT_CONFIG).map(([value, {label}]) => (
            <option key={value} value={value}>
                {label}
            </option>
        ))}
      </select>
      {component?.Component && <component.Component />}
    </div>
  );
}