import { create } from "zustand";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { Page } from "@ueu/ueu-canvas/content/pages/Page";
import { getCourseData } from "@ueu/ueu-canvas/course";
import { IPageData } from "@ueu/ueu-canvas/content/pages/types";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import apiWriteConfig from "@ueu/ueu-canvas/fetch/apiWriteConfig";

/**
 * Per-course cached data. Fetched once per course, reused by profile application,
 * validations, and anything else that reads course content.
 *
 * Pages are cached with bodies included — the body is needed for data-attribute
 * scanning and profile rendering. For courses with many pages this is the expensive
 * call; the cache is what makes it a one-time cost.
 *
 * Keyed by "{instance}:{courseId}" to support multiple Canvas instances.
 * The default instance covers the current browser context.
 */
interface CourseCacheEntry {
  course: Course;
  pages?: Page[];
  syllabus?: string;
  frontPage?: Page | null;
}

const DEFAULT_INSTANCE = "default";

type CourseKey = `${string}:${number}`;

function courseKey(courseId: number, instance: string = DEFAULT_INSTANCE): CourseKey {
  return `${instance}:${courseId}`;
}

interface CourseDataState {
  cache: Record<CourseKey, CourseCacheEntry>;

  getOrLoadCourse: (courseId: number, instance?: string) => Promise<CourseCacheEntry>;
  getPages: (courseId: number, instance?: string) => Promise<Page[]>;
  getSyllabus: (courseId: number, instance?: string) => Promise<string>;
  getFrontPage: (courseId: number, instance?: string) => Promise<Page | null>;
  getPageBySlug: (courseId: number, slug: string, instance?: string) => Promise<Page | null>;
  invalidate: (courseId: number, instance?: string) => void;
  clear: () => void;
}

export const useCourseDataStore = create<CourseDataState>((set, get) => ({
  cache: {},

  getOrLoadCourse: async (courseId: number, instance?: string) => {
    const key = courseKey(courseId, instance);
    const existing = get().cache[key];
    if (existing) return existing;

    const data = await getCourseData(courseId, {
      queryParams: { include: ["total_students"] },
    });
    const course = new Course(data);
    const entry: CourseCacheEntry = { course };
    set((s) => ({ cache: { ...s.cache, [key]: entry } }));
    return entry;
  },

  getPages: async (courseId: number, instance?: string) => {
    const key = courseKey(courseId, instance);
    const entry = await get().getOrLoadCourse(courseId, instance);
    if (entry.pages) return entry.pages;

    const pages = await entry.course.getPages({
      queryParams: { include: ["body"] },
    });
    const updated = { ...entry, pages };
    set((s) => ({ cache: { ...s.cache, [key]: updated } }));
    return pages;
  },

  getSyllabus: async (courseId: number, instance?: string) => {
    const key = courseKey(courseId, instance);
    const entry = await get().getOrLoadCourse(courseId, instance);
    if (entry.syllabus !== undefined) return entry.syllabus;

    const syllabus = await entry.course.getSyllabus();
    const updated = { ...entry, syllabus };
    set((s) => ({ cache: { ...s.cache, [key]: updated } }));
    return syllabus;
  },

  getFrontPage: async (courseId: number, instance?: string) => {
    const key = courseKey(courseId, instance);
    const entry = await get().getOrLoadCourse(courseId, instance);
    if (entry.frontPage !== undefined) return entry.frontPage;

    const frontPage = await entry.course.getFrontPage();
    const updated = { ...entry, frontPage };
    set((s) => ({ cache: { ...s.cache, [key]: updated } }));
    return frontPage;
  },

  getPageBySlug: async (courseId: number, slug: string, instance?: string) => {
    const pages = await get().getPages(courseId, instance);
    return pages.find((p) => (p.rawData as IPageData).url === slug) ?? null;
  },

  invalidate: (courseId: number, instance?: string) => {
    const key = courseKey(courseId, instance);
    set((s) => {
      const { [key]: _, ...rest } = s.cache;
      return { cache: rest };
    });
  },

  clear: () => set({ cache: {} }),
}));

/**
 * The data-attribute convention for profile-bearing pages.
 * A page whose body contains any of these is a profile target.
 */
const PROFILE_DATA_ATTRS = [
  "data-profile-name",
  "data-profile-bio",
  "data-profile-image",
];

export type ProfilePageResult =
  | { status: "found"; slug: string; blueprintPageId: number }
  | { status: "none" }
  | { status: "ambiguous"; candidates: string[] };

/**
 * Scan a blueprint's pages to find which page slug carries profile data attributes.
 *
 * No front-page fallback: a course without a data-attribute page returns "none"
 * rather than guessing, and a course with more than one returns "ambiguous"
 * rather than silently picking the first match. Both are surfaced to the caller
 * so a resolution failure is visible instead of quietly rendering into the
 * wrong page (or nothing at all).
 *
 * Call once per blueprint, then use the slug across all its sections.
 */
export async function findProfilePageSlug(blueprintCourseId: number, instance?: string): Promise<ProfilePageResult> {
  const pages = await useCourseDataStore.getState().getPages(blueprintCourseId, instance);

  const matches = pages.filter((page) => PROFILE_DATA_ATTRS.some((attr) => (page.body ?? "").includes(attr)));

  if (matches.length === 0) return { status: "none" };
  if (matches.length > 1) {
    return { status: "ambiguous", candidates: matches.map((page) => (page.rawData as IPageData).url) };
  }
  const rawData = matches[0].rawData as IPageData;
  return { status: "found", slug: rawData.url, blueprintPageId: rawData.page_id };
}

/**
 * Fetch a specific page from a section by slug. Uses the store cache when the
 * section's pages are already loaded; otherwise does a targeted single-page fetch.
 */
export async function getProfilePage(courseId: number, slug: string, instance?: string): Promise<Page | null> {
  return useCourseDataStore.getState().getPageBySlug(courseId, slug, instance);
}

/**
 * Set whether a single wiki page on a blueprint is restricted (locked) from being
 * changed in associated courses. blueprintPageId is the page's id on the blueprint
 * course itself (see ProfilePageResult.blueprintPageId), not on an associated section.
 *
 * Canvas has no documented API to read an item's current restriction state, so
 * callers that unlock an item for a write pass should always re-lock it afterward
 * (in a finally) rather than try to restore a "previous" state.
 */
export async function restrictBlueprintPage(
  blueprintCourseId: number,
  blueprintPageId: number,
  restricted: boolean
): Promise<void> {
  const url = `/api/v1/courses/${blueprintCourseId}/blueprint_templates/default/restrict_item`;
  await fetchJson(
    url,
    apiWriteConfig("PUT", {
      content_type: "wiki_page",
      content_id: blueprintPageId,
      restricted,
    })
  );
}
