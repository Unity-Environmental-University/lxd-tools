import { profileFromFacultyPage, readProfileFromPage, renderProfile } from "../profileRenderer";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";

const SEED = Number(process.env.TEST_SEED ?? Date.now());
const RUNS = 50;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const pick = <T>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length)];
const shuffle = <T>(r: () => number, xs: T[]): T[] => [...xs].sort(() => r() - 0.5);

const KEYS = ["title", "pronouns", "office-hours", "department", "email"];
const RESERVED = ["name", "bio", "image", "message", "help"];
const VALUES = ["Professor", "she/her", "Tue 2–4pm", "Marine & Coastal", "O'Neil <3"];
const WRAPPERS = [(x: string) => x, (x: string) => `<div><section>${x}</section></div>`, (x: string) => `<p>${x}</p>`];

function randomPage(r: () => number) {
  const keys = shuffle(r, KEYS).slice(0, 1 + Math.floor(r() * KEYS.length));
  const expected = Object.fromEntries(keys.map((k) => [k, pick(r, VALUES)]));
  const parts = keys.map((k) => pick(r, WRAPPERS)(`<span data-profile-${k}>  ${expected[k]}\n</span>`));
  const noise = RESERVED.map((k) => `<span data-profile-${k}>reserved ${k}</span>`);
  return { html: shuffle(r, [...parts, ...noise]).join("\n"), expected };
}

describe(`readProfileFromPage fields (seed ${SEED})`, () => {
  it("returns exactly the custom data-profile-* elements as trimmed text, in any order or nesting", () => {
    const r = rng(SEED);
    for (let i = 0; i < RUNS; i++) {
      const { html, expected } = randomPage(r);
      const fields = readProfileFromPage(html)?.fields;
      if (!sameEntries(fields, expected)) {
        throw new Error(`fields ${JSON.stringify(fields)} != ${JSON.stringify(expected)} for ${html} (seed ${SEED})`);
      }
    }
  });

  it("omits blank custom elements and keeps the first when a key repeats", () => {
    const fields = readProfileFromPage(
      `<i data-profile-title> </i><i data-profile-office>first</i><i data-profile-office>second</i>`,
    )?.fields;
    expect(fields).toEqual({ office: "first" });
  });
});

describe(`custom fields round-trip (seed ${SEED})`, () => {
  it("rendering a page's own fields into a template of the same tags reads back unchanged", () => {
    const r = rng(SEED);
    const user = { id: 1, name: "U" } as IUserData;
    for (let i = 0; i < RUNS; i++) {
      const { html: source, expected } = randomPage(r);
      const template = Object.keys(expected).map((k) => `<span data-profile-${k}>placeholder</span>`).join("");
      const rendered = renderProfile(template, { user, fields: readProfileFromPage(source)?.fields }, 1);
      if (!sameEntries(readProfileFromPage(rendered)?.fields, expected)) {
        throw new Error(`round trip lost fields for ${source} (seed ${SEED})`);
      }
    }
  });

  it("leaves template tags the profile has no field for as they were", () => {
    const rendered = renderProfile(`<i data-profile-title>keep</i>`, { user: { id: 1, name: "U" } as IUserData, fields: {} }, 1);
    expect(readProfileFromPage(rendered)?.fields).toEqual({ title: "keep" });
  });
});

describe(`profileFromFacultyPage names (seed ${SEED})`, () => {
  const user = { id: 7, name: "U" } as IUserData;
  const SHELLS = ["<strong><em></em></strong>", "<strong></strong>", "<em> </em>", ""];
  const NAMES = ["Laura Cyr", "Dr. Julia Meszaros", "Ozum Yesiltas, Ph.D.", "Milca Rosa-Velazquez"];
  const wrap = (inner: string) => `<h4>Instructor</h4><div class="column">${inner}<p>Contact via Canvas Conversations.</p></div>`;

  it("never leaves a titled page nameless, whatever shells and name markup the body has", () => {
    const r = rng(SEED);
    for (let i = 0; i < RUNS; i++) {
      const title = ` ${pick(r, NAMES)}${pick(r, ["", " "])}`;
      const shells = Array.from({ length: Math.floor(r() * 3) }, () => pick(r, SHELLS)).join("");
      const body = wrap(`${shells}<em><strong>${title.trim()}</strong></em>`);
      const name = profileFromFacultyPage({ body, title } as never, user).displayName;
      if (!name || name !== name.trim()) throw new Error(`name ${JSON.stringify(name)} for ${body} (seed ${SEED})`);
    }
  });

  it("keeps the name the page itself gives over its title", () => {
    const body = wrap(`<strong><em>Gina Fisher Caldwell</em></strong>`);
    expect(profileFromFacultyPage({ body, title: "Gina Caldwell" } as never, user).displayName).toBe("Gina Fisher Caldwell");
  });

  it("falls back to the title when the body names nobody", () => {
    expect(profileFromFacultyPage({ body: wrap("<strong><em></em></strong>"), title: "Alan Kryszak " } as never, user).displayName).toBe("Alan Kryszak");
  });
});

describe("profileFromFacultyPage", () => {
  const user = { id: 7, name: "U" } as IUserData;

  it("reads a tagged page by its tags and remembers the source page", () => {
    const page = { body: `<h2 data-profile-name>Dr. Ng</h2><b data-profile-title>Professor</b>` } as never;
    const profile = profileFromFacultyPage(page, user) as ReturnType<typeof readProfileFromPage>;
    expect(profile?.displayName).toBe("Dr. Ng");
    expect(profile?.fields).toEqual({ title: "Professor" });
    expect(profile?.sourcePage).toBe(page);
  });
});

function sameEntries(a: Record<string, string> | undefined, b: Record<string, string>) {
  if (!a) return false;
  const keys = Object.keys(b);
  return Object.keys(a).length === keys.length && keys.every((k) => a[k] === b[k]);
}
