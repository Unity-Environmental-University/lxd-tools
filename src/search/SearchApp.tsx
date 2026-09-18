import { useState } from "react";
import { GenericSearch } from "./components";

// TODO make an openapi spec for lisa so I don't have to maintain this
// TODO also LISA currently uses separate get endpoints
// that might change to a single POST in the future?
const ENDPOINT_CONFIG = {
  'search-syllabi':
    {
      label: 'Syllabi',
      allowed_sort_columns:
        [
          "id",
          "name",
          "resource_link"
        ]
    },
  'search-assignments':
    {
      label: 'Assignments',
      allowed_sort_columns:
        [
          "course_id",
          "course_name",
          "id",
          "title"
        ]
    },
  'search-pages':
    {
      label: 'Pages',
      allowed_sort_columns:
        [
          "course_id",
          "course_name",
          "id",
          "title"
        ]
    },
  'search-topics':
    {
      label: 'Discussion Topics',
      allowed_sort_columns:
        [
          "course_id",
          "course_name",
          "id",
          "title",
          "type"
        ]
    },
  'search-topic-replies':
    {
      label: 'Discussion Entries',
      allowed_sort_columns:
        [
          "course_id",
          "course_name",
          "id",
          "discussion_title",
          "discussion_topic_id",
          "parent_id"
        ]
    },
  'search-filenames':
    {
      label: 'Filenames',
      allowed_sort_columns:
        [
          "course_id",
          "course_name",
          "id",
          "workflow_state",
          "created_at",
          "updated_at",
          "modified_at",
          "viewed_at",
          "folder_id",
          "file_state",
          "size",
          "display_name",
          "content_type",
          "original_copy_id"
        ]
    },
  'search-quizzes':
    {
      label: 'Quizzes',
      allowed_sort_columns:
        [
          "course_id",
          "course_name",
          "id",
          "title",
          "question_count",
          "quiz_type",
          "scoring_policy",
          "show_correct_answers",
          "shuffle_answers",
          "allowed_attempts",
          "assignment_id",
          "points_possible",
          "published_at",
          "due_at",
          "created_at",
          "updated_at",
          "workflow_state"
        ]
    },
  'search-questions':
    {
      label: 'Quiz Questions',
      allowed_sort_columns:
        [
          "course_id",
          "course_name",
          "id",
          "bank_id",
          "created_at",
          "updated_at",
          "question_title",
          "bank_title"
        ]
    },
}

type EndpointKey = keyof typeof ENDPOINT_CONFIG;

export function SearchApp() {
  const [endpoint, setEndpoint] = useState<EndpointKey | "">("");
  const allowed_sort_columns = endpoint ? ENDPOINT_CONFIG[endpoint].allowed_sort_columns : []

  return (
    <div className="ResultsApp container">
      <select value={endpoint} onChange={(e) => setEndpoint(e.target.value as EndpointKey)}>
        <option value="">Pick endpoint</option>
        {Object.entries(ENDPOINT_CONFIG).map(([value, {label}]) => (
            <option key={value} value={value}>
                {label}
            </option>
        ))}
      </select>
      {endpoint != "" && 
        (<GenericSearch
          endpoint={endpoint}
          allowed_sort_columns={allowed_sort_columns}
        />)
      }
    </div>
  );
}