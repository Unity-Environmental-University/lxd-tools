import { IProfile } from "@ueu/ueu-canvas/type";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";
import { renderProfileIntoCurioFrontPage } from "@ueu/ueu-canvas/profile";

type ProfileWithUser = IProfile & { user: IUserData };

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
 * Example template HTML:
 *   <h2 data-profile-name>Instructor Name</h2>
 *   <div data-profile-bio>Bio goes here</div>
 *   <div data-profile-image><img src="placeholder.png" /></div>
 */
const ATTR = {
  name: "data-profile-name",
  bio: "data-profile-bio",
  image: "data-profile-image",
} as const;

export function hasDataProfileAttributes(html: string): boolean {
  return Object.values(ATTR).some((attr) => html.includes(attr));
}

function renderProfileByDataAttributes(html: string, profile: ProfileWithUser): string {
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
export function renderProfile(html: string, profile: ProfileWithUser): string {
  if (hasDataProfileAttributes(html)) {
    return renderProfileByDataAttributes(html, profile);
  }
  return renderProfileIntoCurioFrontPage(html, profile);
}

/**
 * Read a profile from a page's HTML, if it uses the data-attribute convention.
 * Returns null for legacy Curio pages — caller should use
 * getCurioPageFrontPageProfile directly for that format instead of guessing.
 */
export function readProfileFromPage(html: string, user?: IUserData): IProfile | null {
  if (!hasDataProfileAttributes(html)) return null;
  return readProfileByDataAttributes(html, user);
}

function readProfileByDataAttributes(html: string, user?: IUserData): IProfile {
  const el = document.createElement("div");
  el.innerHTML = html;

  const nameEl = el.querySelector(`[${ATTR.name}]`);
  const bioEl = el.querySelector(`[${ATTR.bio}]`);
  const imageEl = el.querySelector(`[${ATTR.image}] img`);

  return {
    user,
    displayName: nameEl?.textContent ?? null,
    bio: bioEl?.innerHTML ?? null,
    imageLink: imageEl instanceof HTMLImageElement ? imageEl.src : null,
  };
}
