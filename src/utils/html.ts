/**
 * Parse an HTML string (e.g. a Canvas page or syllabus body) into a detached
 * <div> that belongs to an inert document.
 *
 * Assigning untrusted HTML to `innerHTML` of an element made with
 * `document.createElement` parses it into the *live* document: even though
 * the element is never attached, resources start loading and inline event
 * handlers such as `<img onerror>` fire. A document created by DOMParser has
 * no browsing context, so nothing parsed into it loads or runs.
 *
 * The HTML is still parsed with a <div> as the context element, exactly as
 * `div.innerHTML = html` did, so leading <link>/<style>/<meta> tags stay in
 * the fragment instead of being hoisted into a <head>, and the container's
 * `innerHTML` round-trips the same markup. DOMParser documents inherit the
 * current document's URL, so properties such as `img.src` still resolve
 * relative URLs the same way.
 */
export function parseHtmlInert(html: string): HTMLDivElement {
  const inertDoc = new DOMParser().parseFromString("", "text/html");
  const container = inertDoc.createElement("div");
  container.innerHTML = html;
  return container;
}
