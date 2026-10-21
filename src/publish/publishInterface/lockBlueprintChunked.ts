import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import { formDataify, getItemTypeAndId } from "@ueu/ueu-canvas/canvasUtils";

/**
 * Restrict (lock) every module item in a blueprint, a chunk at a time to avoid rate limiting.
 *
 * Canvas's restrict_item endpoint needs the *content* type (`assignment`, `wiki_page`, ...)
 * and the *content* id, not the module item's own `type` / `id`. `getItemTypeAndId` does that
 * translation (and looks up the page_id for pages). Items Canvas can't restrict (subheaders,
 * external URLs) come back without an id and are skipped.
 */
export async function lockBlueprintChunked(
  courseId: number,
  modules: any[],
  onProgress?: (status: string, completion: number) => void,
  chunkSize: number = 10,
  delayMs: number = 500
) {
  const items: any[] = modules.flatMap((module) => module.items ?? []);

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const completion = Math.round((i / items.length) * 100);
    onProgress?.(`Locking (${i}/${items.length})`, completion);

    await Promise.all(
      chunk.map(async (item) => {
        const { type, id } = await getItemTypeAndId(item);
        if (!type || typeof id === "undefined") return;
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
    if (i + chunkSize < items.length) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  onProgress?.("Locking complete", 100);
}
