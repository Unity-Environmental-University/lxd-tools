import { renderProfile } from "../profileRenderer";
import { IProfile } from "@ueu/ueu-canvas/type";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";

const mockUser: IUserData = {
  id: 1,
  name: "Jane Doe",
  email: "jdoe@unity.edu",
} as IUserData;

const makeProfile = (overrides: Partial<IProfile> = {}): IProfile & { user: IUserData } => ({
  user: mockUser,
  displayName: "Dr. Jane Doe",
  bio: "<p>Expert in marine biology.</p>",
  imageLink: "https://example.com/jane.jpg",
  ...overrides,
});

const mockCourseId = 8292463;

describe("renderProfile", () => {
  describe("data-attribute pages", () => {
    const templateHtml = `
      <div>
        <h2 data-profile-name>Placeholder Name</h2>
        <div data-profile-bio>Placeholder bio</div>
        <div data-profile-image><img src="placeholder.png" alt="placeholder" /></div>
        <a data-profile-message href="#">Message Instructor</a>
        <div data-profile-help>Setup instructions for template authors.</div>
      </div>
    `;

    it("fills in name, bio, and image from profile", () => {
      const result = renderProfile(templateHtml, makeProfile(), mockCourseId);
      expect(result).toContain("Dr. Jane Doe");
      expect(result).toContain("Expert in marine biology.");
      expect(result).toContain("jane.jpg");
      expect(result).not.toContain("Placeholder Name");
      expect(result).not.toContain("Placeholder bio");
    });

    it("strips data-profile-help elements from the written page", () => {
      const result = renderProfile(templateHtml, makeProfile(), mockCourseId);
      expect(result).not.toContain("Setup instructions for template authors.");
      expect(result).not.toContain("data-profile-help");
    });

    it("appends contact info to bio when user has email", () => {
      const result = renderProfile(templateHtml, makeProfile(), mockCourseId);
      expect(result).toContain("jdoe@unity.edu");
      expect(result).toContain("Canvas Inbox");
    });

    it("wires the message link to Canvas's Inbox compose for the user in the course", () => {
      const result = renderProfile(templateHtml, makeProfile(), mockCourseId);
      expect(result).toContain(`context_id=course_${mockCourseId}`);
      expect(result).toContain("user_id=1");
      expect(result).toContain("Jane+Doe");
    });

    it("leaves elements alone when profile fields are missing", () => {
      const result = renderProfile(templateHtml, makeProfile({
        displayName: null,
        bio: null,
        imageLink: null,
        image: null,
      }), mockCourseId);
      // Name element keeps placeholder since displayName is null
      expect(result).toContain("Placeholder Name");
    });

    it("handles a page with only some data attributes", () => {
      const partial = `<div><span data-profile-name>Name</span><p>No bio or image attrs</p></div>`;
      const result = renderProfile(partial, makeProfile(), mockCourseId);
      expect(result).toContain("Dr. Jane Doe");
    });
  });

  describe("legacy Curio pages", () => {
    const curioHtml = `
      <div>
        <h2>Meet your instructor, Old Name!</h2>
        <div>
          <div class="cbt-instructor-bio"><p>Old bio</p></div>
          <img src="old.png" />
        </div>
      </div>
    `;

    it("falls back to Curio renderer when no data attributes present", () => {
      const result = renderProfile(curioHtml, makeProfile(), mockCourseId);
      expect(result).toContain("Meet your instructor, Dr. Jane Doe!");
      expect(result).toContain("Expert in marine biology.");
    });
  });
});
