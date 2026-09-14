import { IProfile, IProfileWithUser } from "@ueu/ueu-canvas/type";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";
import { renderProfileIntoCurioFrontPage } from "@ueu/ueu-canvas/profile";

type ProfileWithUser = IProfile & { user: IUserData };

/**
 * Data-attribute convention for profile pages. Templates mark elements with
 * these attributes; the renderer finds them and fills in profile content.
 *
 * Example template HTML:
 *   <h2 data-profile-name>Instructor Name</h2>
 *   <div data-profile-bio>Bio goes here</div>
 *   <img data-profile-image src="placeholder.png" />
 */
const ATTR = {
  name: "data-profile-name",
  bio: "data-profile-bio",
  image: "data-profile-image",
} as const;

function hasDataProfileAttributes(html: string): boolean {
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

  const imageEl = el.querySelector(`[${ATTR.image}]`);
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
 * Read a profile from a page's HTML. Detects format the same way.
 */
export function readProfileFromPage(html: string, user?: IUserData): IProfile {
  if (hasDataProfileAttributes(html)) {
    return readProfileByDataAttributes(html, user);
  }
  // Fall through to legacy — caller can use getCurioPageFrontPageProfile directly
  // if they need the legacy path. This function exists for the data-attribute path.
  return readProfileByDataAttributes(html, user);
}

function readProfileByDataAttributes(html: string, user?: IUserData): IProfile {
  const el = document.createElement("div");
  el.innerHTML = html;

  const nameEl = el.querySelector(`[${ATTR.name}]`);
  const bioEl = el.querySelector(`[${ATTR.bio}]`);
  const imageEl = el.querySelector(`[${ATTR.image}]`);

  return {
    user,
    displayName: nameEl?.textContent ?? null,
    bio: bioEl?.innerHTML ?? null,
    imageLink: imageEl instanceof HTMLImageElement ? imageEl.src : null,
  };
}
