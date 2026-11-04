import { IProfile } from "@ueu/ueu-canvas/type";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";
import { getCurioPageFrontPageProfile, getProfileFromPage, renderProfileIntoCurioFrontPage } from "@ueu/ueu-canvas/profile";

/** Any other data-profile-<key> element on the page, read as plain text under its key. */
export type TemplateProfile = IProfile & { fields: Record<string, string> };

type FacultyPage = Parameters<typeof getProfileFromPage>[0];

type ProfileWithUser = IProfile & { user: IUserData; fields?: Record<string, string> };

/**
 * Data-attribute convention for profile pages. Templates mark elements with
 * these attributes; the renderer finds them and fills in profile content.
 *
 * data-profile-image goes on a wrapper around the <img>, not the <img> itself:
 * Canvas's page renderer strips non-standard data-* attributes from <img> tags
 * (confirmed by inspecting the live rendered DOM vs. the API-fetched page body —
 * the attribute survives in the stored body but never reaches the rendered
 * element), so it never survives on the image element itself, and re-saving
 * through the RCE drops it again on every edit.
 *
 * data-profile-message marks an <a> whose href is set to open Canvas's Inbox
 * compose window addressed to the instructor within the page's own course, so
 * a "Message Instructor" link can be placed anywhere in the page's own layout
 * rather than being a fixed button the extension bolts on separately. Non-<a>
 * elements are left as-is: a static saved page has no JS to wire up a click
 * handler on anything else.
 *
 * data-profile-help marks an element (e.g. a setup instructions box) that
 * should be stripped out the moment a real profile is written — it's for
 * whoever is building the template, not for students viewing the finished
 * page. Any number of elements can carry it.
 *
 * Example template HTML:
 *   <h2 data-profile-name>Instructor Name</h2>
 *   <div data-profile-bio>Bio goes here</div>
 *   <div data-profile-image><img src="placeholder.png" /></div>
 *   <a data-profile-message href="#">Message Instructor</a>
 *   <div data-profile-help>Setup instructions for whoever built this page.</div>
 */
const ATTR = {
  name: "data-profile-name",
  bio: "data-profile-bio",
  image: "data-profile-image",
  message: "data-profile-message",
  help: "data-profile-help",
} as const;

/**
 * Canvas's Inbox compose view, pre-addressed to a user within a course context.
 * Matches the URL Canvas itself generates for the "Message <user> in Canvas"
 * link on a user's course page — confirmed against that link directly, not
 * guessed: plain query params (not a #compose hash), context_id as
 * "course_<id>", and user_id as the bare numeric id (no "user_" prefix).
 */
function inboxComposeUrl(courseId: number, user: IUserData): string {
  const params = new URLSearchParams({
    context_id: `course_${courseId}`,
    user_id: String(user.id),
    user_name: user.name,
  });
  return `/conversations?${params.toString()}`;
}

const ATTR_PREFIX = "data-profile-";
const RESERVED_ATTRS: ReadonlySet<string> = new Set(Object.values(ATTR));

export function hasDataProfileAttributes(html: string): boolean {
  return html.includes(ATTR_PREFIX);
}

function readExtraFields(root: Element): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const node of Array.from(root.querySelectorAll("*"))) {
    for (const { name } of Array.from(node.attributes)) {
      if (!name.startsWith(ATTR_PREFIX) || RESERVED_ATTRS.has(name)) continue;
      const key = name.slice(ATTR_PREFIX.length);
      const text = node.textContent?.trim();
      if (text && !(key in fields)) fields[key] = text;
    }
  }
  return fields;
}

function renderProfileByDataAttributes(html: string, profile: ProfileWithUser, courseId: number): string {
  const el = document.createElement("div");
  el.innerHTML = html;

  const nameEl = el.querySelector(`[${ATTR.name}]`);
  if (nameEl && profile.displayName) {
    nameEl.textContent = profile.displayName;
  }

  const bioEl = el.querySelector(`[${ATTR.bio}]`);
  if (bioEl && profile.bio) {
    bioEl.innerHTML = profile.bio;
    if (profile.user?.email) {
      const contact = document.createElement("p");
      contact.textContent = `${profile.displayName} should be contacted during the term using Canvas Inbox, but can be reached after and before the term via their email address: ${profile.user.email}`;
      bioEl.appendChild(contact);
    }
  }

  const imageEl = el.querySelector(`[${ATTR.image}] img`);
  if (imageEl instanceof HTMLImageElement) {
    if (profile.image) {
      imageEl.src = profile.image.src;
      imageEl.alt = profile.image.alt ?? profile.displayName ?? "";
    } else if (profile.imageLink) {
      imageEl.src = profile.imageLink;
    }
  }

  const messageEl = el.querySelector(`[${ATTR.message}]`);
  if (messageEl instanceof HTMLAnchorElement && profile.user) {
    messageEl.href = inboxComposeUrl(courseId, profile.user);
  }

  for (const [key, text] of Object.entries(profile.fields ?? {})) {
    const attr = ATTR_PREFIX + key;
    if (RESERVED_ATTRS.has(attr)) continue;
    for (const node of Array.from(el.querySelectorAll("*"))) {
      if (node.hasAttribute(attr)) node.textContent = text;
    }
  }

  el.querySelectorAll(`[${ATTR.help}]`).forEach((node) => node.remove());

  return el.innerHTML;
}

/**
 * Render a profile into a page's HTML. Detects the page format automatically:
 * - Pages with data-profile-* attributes use the data-attribute renderer
 * - Pages with the Curio "Meet your instructor" structure use the legacy renderer
 *
 * This is the single call site for profile rendering — the format decision
 * is made here, not by the caller.
 */
export function renderProfile(html: string, profile: ProfileWithUser, courseId: number): string {
  if (hasDataProfileAttributes(html)) {
    return renderProfileByDataAttributes(html, profile, courseId);
  }
  return renderProfileIntoCurioFrontPage(html, profile);
}

export type ProfileRenderResult =
  | { ok: true; html: string; written: IProfile }
  | { ok: false; problem: string };

function plainText(html: string): string {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent ?? "";
}

/**
 * renderProfile, but reads the result back: legacy pages throw when the
 * "Meet your instructor" section is missing and silently skip the bio and
 * image when their elements are missing, so a render that returns HTML has
 * not necessarily written anything.
 */
export function renderProfileVerified(html: string, profile: ProfileWithUser, courseId: number): ProfileRenderResult {
  let rendered: string;
  try {
    rendered = renderProfile(html, profile, courseId);
  } catch {
    return { ok: false, problem: "Couldn't find the profile section on the page" };
  }
  const written = hasDataProfileAttributes(rendered)
    ? readProfileFromPage(rendered)
    : getCurioPageFrontPageProfile(rendered);
  const nameLanded =
    !profile.displayName || plainText(written?.displayName ?? "") === plainText(profile.displayName);
  if (!written || !nameLanded) {
    return { ok: false, problem: `"${profile.displayName}" did not land on the page` };
  }
  return { ok: true, html: rendered, written };
}

/**
 * Read a profile from a page's HTML, if it uses the data-attribute convention.
 * Returns null for legacy Curio pages — caller should use
 * getCurioPageFrontPageProfile directly for that format instead of guessing.
 */
export function readProfileFromPage(html: string, user?: IUserData): TemplateProfile | null {
  if (!hasDataProfileAttributes(html)) return null;
  return readProfileByDataAttributes(html, user);
}

function readProfileByDataAttributes(html: string, user?: IUserData): TemplateProfile {
  const el = document.createElement("div");
  el.innerHTML = html;

  const nameEl = el.querySelector(`[${ATTR.name}]`);
  const bioEl = el.querySelector(`[${ATTR.bio}]`);
  const imageEl = el.querySelector(`[${ATTR.image}] img`);

  return {
    user,
    displayName: nameEl?.textContent?.trim() || null,
    bio: bioEl?.innerHTML ?? null,
    imageLink: imageEl instanceof HTMLImageElement ? imageEl.src : null,
    fields: readExtraFields(el),
  };
}

/**
 * Profile for a Faculty Bios page: a page tagged with data-profile-* is read by
 * its tags; an untagged legacy page falls back to the library's layout guessing.
 * Bio pages are titled with the instructor's name, which stands in when the
 * layout guess finds none (e.g. an empty <strong><em></em></strong> shell).
 */
export function profileFromFacultyPage(page: FacultyPage, user: IUserData): IProfile {
  const tagged = readProfileFromPage(page.body ?? "", user);
  const profile = tagged ? { ...tagged, sourcePage: page } : getProfileFromPage(page, user);
  return { ...profile, displayName: profile.displayName?.trim() || page.title?.trim() || null };
}
