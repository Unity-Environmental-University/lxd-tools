import { normaliseName, readProfileFromPage, renderProfileVerified } from "../profileRenderer";
import { IProfile } from "@ueu/ueu-canvas/type";
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

function randomName(r: () => number) {
  return `${pick(r, ["Dr.", "Prof.", ""])} ${pick(r, ["Jane", "Omar", "Li & Co", "Zoë"])} ${pick(r, ["Doe", "Ng", "O'Neil"])}`.trim();
}

function randomProfile(r: () => number) {
  return {
    user: { id: 1, name: "U", email: "u@unity.edu" } as IUserData,
    displayName: randomName(r),
    bio: `<p>${pick(r, ["Marine biology", "Ecology", "Data"])}</p>`,
  } as IProfile & { user: IUserData };
}

const pagesWithoutProfileStructure = [
  "<p>Welcome</p>",
  "<h2>Course overview</h2><div>text</div>",
  "",
  "<h2>Meet your instructor</h2>",
];

const pagesWithProfileStructure = [
  '<h2 data-profile-name>x</h2><div data-profile-bio>y</div>',
  '<h2>Meet your instructor, Old!</h2><div><div class="cbt-instructor-bio"><p>old</p></div></div>',
];

describe(`renderProfileVerified (seed ${SEED})`, () => {
  it("never throws, and never reports ok for a page with no profile structure", () => {
    const r = rng(SEED);
    for (let i = 0; i < RUNS; i++) {
      const profile = randomProfile(r);
      const page = pick(r, pagesWithoutProfileStructure);
      const result = renderProfileVerified(page, profile, 1);
      if (result.ok) throw new Error(`ok on structureless page ${JSON.stringify(page)} (seed ${SEED})`);
    }
  });

  it("when ok, the written profile carries the requested name (seed printed on failure)", () => {
    const r = rng(SEED);
    for (let i = 0; i < RUNS; i++) {
      const profile = randomProfile(r);
      const page = pick(r, pagesWithProfileStructure);
      const result = renderProfileVerified(page, profile, 1);
      if (!result.ok) throw new Error(`not ok on ${JSON.stringify(page)} for ${profile.displayName} (seed ${SEED})`);
      expect(normaliseName(result.written.displayName ?? "")).toContain(normaliseName(profile.displayName!));
    }
  });
});

describe("readProfileFromPage names", () => {
  it.each(["", " ", "\n\t "])("reads a blank name element (%j) as null", (blank) => {
    const profile = readProfileFromPage(`<h2 data-profile-name>${blank}</h2>`);
    expect(profile?.displayName).toBeNull();
  });
});

describe("normaliseName", () => {
  it.each([
    ["Dr. Li &amp; Co Doe", "Dr. Li & Co Doe"],
    ["O&#39;Neil", "O'Neil"],
    ["O&#x27;Neil", "O'Neil"],
    ["Zo\u00eb", "Zo\u00eb"],
    ["A&nbsp;B", "A B"],
    ["  A \n\t B  ", "A B"],
    ["1 &lt; 2 &gt; 0", "1 < 2 > 0"],
  ])("normalises %j to %j", (input, expected) => {
    expect(normaliseName(input)).toBe(expected);
  });

  it("decodes only once, so escaped references stay escaped", () => {
    expect(normaliseName("&amp;lt;b&amp;gt;")).toBe("&lt;b&gt;");
  });

  it("leaves unknown or invalid references alone", () => {
    expect(normaliseName("&euml; &#0; &#99999999; &bogus;")).toBe("&euml; &#0; &#99999999; &bogus;");
  });

  it("does not parse its input as markup", () => {
    expect(normaliseName("<b>x</b>")).toBe("<b>x</b>");
  });

  it("treats the serialized and plain forms of a name as equal", () => {
    expect(normaliseName("Li &amp; Co")).toBe(normaliseName("Li & Co"));
  });
});
