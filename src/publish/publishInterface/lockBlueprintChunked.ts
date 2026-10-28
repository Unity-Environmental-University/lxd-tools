import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import { formDataify, getItemTypeAndId } from "@ueu/ueu-canvas/canvasUtils";
import type { Course } from "@ueu/ueu-canvas/course/Course";
import { findProfilePageSlug, restrictBlueprintPage } from "@publish/fixesAndUpdates/courseDataStore";

/**
 * Page ids that must stay unlocked: the profile page and the home page. Sections
 * need to write to these pages (including when the profile page falls back to home).
 */
export async function getNeverLockedPageIds(course: Course): Promise<Set<number>> {
  const ids = new Set<number>();
  const profile = await findProfilePageSlug(course.id);
  if (profile.status === "found") ids.add(profile.blueprintPageId);
  const front = await course.getFrontPage();
  const frontId = (front?.rawData as { page_id?: number } | undefined)?.page_id;
  if (frontId !== undefined) ids.add(frontId);
  return ids;
}

/** Unlock pages left locked by earlier runs before they became exempt. */
export async function unlockNeverLockedPages(course: Course): Promise<number> {
  const ids = await getNeverLockedPageIds(course);
  for (const id of ids) await restrictBlueprintPage(course.id, id, false);
  return ids.size;
}

/**
 * Restrict (lock) every module item in a blueprint, a chunk at a time to avoid rate limiting.
 *
 * Canvas's restrict_item endpoint needs the *content* type (`assignment`, `wiki_page`, ...)
 * and the *content* id, not the module item's own `type` / `id`. `getItemTypeAndId` does that
 * translation (and looks up the page_id for pages). Subheaders, external URLs, and external
 * tools are skipped because they aren't lockable in this migration workflow. Home and profile
 * pages are skipped by id and are explicitly unlocked after the pass.
 */
export interface BlueprintLockFailure {
  item: any;
  error: unknown;
}

export async function lockBlueprintChunked(
  courseId: number,
  modules: any[],
  onProgress?: (status: string, completion: number) => void,
  chunkSize: number = 10,
  delayMs: number = 500,
  neverLock: Set<number> = new Set()
): Promise<BlueprintLockFailure[]> {
  const items: any[] = modules.flatMap((module) => module.items ?? []);
  const failures: BlueprintLockFailure[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const completion = Math.round((i / items.length) * 100);
    onProgress?.(`Locking (${i}/${items.length})`, completion);

    const results = await Promise.allSettled(
      chunk.map(async (item) => {
        if (item.type === "ExternalTool") return;
        const { type, id } = await getItemTypeAndId(item);
        if (!type || typeof id === "undefined") return;
        if (type === "wiki_page" && neverLock.has(Number(id))) return;
        await fetchJson(`/api/v1/courses/${courseId}/blueprint_templates/default/restrict_item`, {
          fetchInit: {
            method: "PUT",
            body: formDataify({
              content_type: type,
              content_id: id,
              restricted: true,
              _method: "PUT",
            }),
          },
        });
      })
    );
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        failures.push({ item: chunk[index], error: result.reason });
      }
    });
    if (i + chunkSize < items.length) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  onProgress?.("Locking complete", 100);
  return failures;
}
