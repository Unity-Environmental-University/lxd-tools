import { readProfileFromPage, renderProfileVerified } from "../profileRenderer";
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
      const el = document.createElement("div");
      el.innerHTML = result.written.displayName ?? "";
      expect(el.textContent).toContain(profile.displayName!);
    }
  });
});

describe("readProfileFromPage names", () => {
  it.each(["", " ", "\n\t "])("reads a blank name element (%j) as null", (blank) => {
    const profile = readProfileFromPage(`<h2 data-profile-name>${blank}</h2>`);
    expect(profile?.displayName).toBeNull();
  });
});
