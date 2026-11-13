import { useState, useEffect } from "react";
import { GenericSearch } from "./components";
import { BASES, setBase, type BaseKey } from "./utils"
import type { SearchPath } from "./types"

// TODO also LISA currently uses separate get endpoints
// that might change to a single POST in the future?

// Typed by every search path in LISA's spec, so adding or removing a search in
// LISA fails the typecheck until it's listed here
const ENDPOINT_LABELS: Record<SearchPath, string> = {
  '/api/search-syllabi': 'Syllabi',
  '/api/search-assignments': 'Assignments',
  '/api/search-pages': 'Pages',
  '/api/search-topics': 'Discussion Topics',
  '/api/search-topic-replies': 'Discussion Entries',
  '/api/search-filenames': 'Filenames',
  '/api/search-quizzes': 'Quizzes',
  '/api/search-questions': 'Quiz Questions',
}

export function SearchApp() {
  const [endpoint, setEndpoint] = useState<SearchPath | "">("");
  const [server, setServer] = useState<BaseKey>("prod");

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
      <select value={endpoint} onChange={(e) => setEndpoint(e.target.value as SearchPath | "")}>
        <option value="">Pick endpoint</option>
        {Object.entries(ENDPOINT_LABELS).map(([value, label]) => (
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
        {" "}Use CE
      </label>
      {endpoint != "" &&
        (<GenericSearch
          key={server}
          endpoint={endpoint}
        />)
      }
    </div>
  );
}
