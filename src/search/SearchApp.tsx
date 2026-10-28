import { useState, useEffect } from "react";
import { GenericSearch } from "./components";
import { BASES, setBase, type BaseKey } from "./utils"

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
  const [server, setServer] = useState<BaseKey>("prod");
  const allowed_sort_columns = endpoint ? ENDPOINT_CONFIG[endpoint].allowed_sort_columns : []

  // set synchronously during render so children's effects see the right base
  setBase(server);
  const loginBase = `${BASES[server]}/login/canvas`;
  const authBase = `${loginBase}/status`;

  // open window for canvas auth if not already authed according to LISA
  useEffect(() => {
    let cancelled = false;

    fetch(authBase, { credentials: 'include' })
      .then(res => res.json())
      .then(({ authed }) => {
        if (!cancelled && !authed) {
          window.open(loginBase);
        }
      })
      .catch(() => {
        // network/server error — treat as unauthed
        if (!cancelled) window.open(loginBase);
      });

    return () => { cancelled = true; };
  }, [authBase, loginBase]);

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
      <label>
        <input
          type="checkbox"
          checked={server === "ce"}
          onChange={(e) => setServer(e.target.checked ? "ce" : "prod")}
        />
        {" "}Use CE server
      </label>
      {endpoint != "" &&
        (<GenericSearch
          key={server}
          endpoint={endpoint}
          allowed_sort_columns={allowed_sort_columns}
        />)
      }
    </div>
  );
}
