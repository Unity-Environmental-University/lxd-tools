// Updates the LISA OpenAPI snapshot (src/search/lisa-api/openapi.json) and
// regenerates its types (src/search/lisa-api/schema.d.ts).
//
//   npm run sync:lisa-api                            # from the prod LISA server
//   npm run sync:lisa-api -- <url>                   # from another LISA server
//   npm run sync:lisa-api -- <lisa>/lisa_backend/openapi.json   # from a LISA checkout
//
// Then run npm run typecheck: any type errors are places the search page relies
// on something LISA changed.
import {execSync} from "node:child_process";
import {readFile, writeFile} from "node:fs/promises";

const SNAPSHOT = "src/search/lisa-api/openapi.json";
const source = process.argv[2] ?? "https://lisa.campus.unity.edu/api/openapi.json";

let text;
if (/^https?:\/\//.test(source)) {
  const res = await fetch(source);
  if (!res.ok) throw new Error(`Failed to fetch ${source}: ${res.status}`);
  text = await res.text();
} else {
  text = await readFile(source, "utf8");
}

// fail before overwriting the snapshot if this isn't an OpenAPI document
const spec = JSON.parse(text);
if (!spec.openapi || !spec.paths) throw new Error(`${source} isn't an OpenAPI spec`);

await writeFile(SNAPSHOT, JSON.stringify(spec, null, 2) + "\n");
console.log(`Wrote ${SNAPSHOT} (LISA API ${spec.info?.version}) from ${source}`);

execSync("npm run gen:lisa-api", {stdio: "inherit"});
