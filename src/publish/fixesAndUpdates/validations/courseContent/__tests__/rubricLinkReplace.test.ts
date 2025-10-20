import {rubricLinkReplace} from "@publish/fixesAndUpdates/validations/courseContent/rubricLinkReplace";
import {testResult} from '@publish/fixesAndUpdates/validations/utils';
import DiscussionKind from '@canvas/content/discussions/DiscussionKind';
import {IDiscussionsHaver} from "@canvas/course/courseTypes";
import {IDiscussionData} from "@/canvas";

const dummyCourse = { id: 59482 } as IDiscussionsHaver;

const createDiscussion = (id: string, title: string, message: string, html_url?: string) => ({
  id,
  title,
  message,
  html_url: html_url || `https://example.com/discussion/${id}`
});

const fakeDataGenerator = function*() {
  yield createDiscussion("1", "Discussion with rubric", `<p>Some text <a href="https://example.com/rubric">View rubric</a></p>`);
  yield createDiscussion("2", "Discussion without rubric", `<p>No rubric link here</p>`);
};

describe("rubricLinkReplace", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("run", () => {
    it("should return success result when no discussion has a rubric link", async () => {
      const fakeGenerator = function*() {
        yield createDiscussion("1", "Discussion no rubric", `<p>No link</p>`);
      };

      jest.spyOn(DiscussionKind, 'dataGenerator').mockReturnValue(fakeGenerator() as any);
      
      const result = await rubricLinkReplace.run(dummyCourse);
      
      expect(result.success).toBe(true);
      expect(result.messages[0].bodyLines[0]).toBe("All rubrics have already been replaced with #");
    });

    it("should return failure result with userData when a discussion has a rubric link", async () => {
      jest.spyOn(DiscussionKind, 'dataGenerator').mockReturnValue(fakeDataGenerator() as any);
      
      const result = await rubricLinkReplace.run(dummyCourse);
      
      expect(result.success).toBe(false);
      expect(result.userData).toHaveLength(1);
      expect(result.messages[0].bodyLines).toContain("Discussion with rubric");
    });
  });

  describe("fix", () => {
    it("should return not run result when there is nothing to fix", async () => {
      jest.spyOn(DiscussionKind, 'dataGenerator').mockReturnValue((async function*(){
        yield createDiscussion("1", "No fix discussion", `<p>No link</p>`) as unknown as IDiscussionData;
      })());
      
      const runResult = await rubricLinkReplace.run(dummyCourse);
      if(rubricLinkReplace.fix) {
          const fixResult = await rubricLinkReplace.fix(dummyCourse, runResult);

          expect(fixResult.success).not.toBe(true);
          // The testResult returns 'not run' in the first parameter if no fix needed.
          expect(fixResult.messages[0].bodyLines[0]).toBe("No rubrics to fix");
      }
    });

    it("should fix discussions with rubric link and call DiscussionKind.put", async () => {
      // Set up a generator with a discussion containing a rubric link.
      const discussion = createDiscussion("1", "Discussion with rubric", `<p>Click <a href="https://example.com/rubric">View rubric</a> for details</p>`);
      const fakeGenerator = function*() {
        yield discussion;
      };
      jest.spyOn(DiscussionKind, 'dataGenerator').mockReturnValue(fakeGenerator() as any);

      // Spy on put to check whether it is called with a modified message
      const putSpy = jest.spyOn(DiscussionKind, 'put').mockImplementation(async (_courseId, _discussionId, payload) => {
        return {_courseId, _discussionId, payload} as unknown as IDiscussionData;
      });

      // First, get a failing run result.
      const runResult = await rubricLinkReplace.run(dummyCourse);
      expect(runResult.success).toBe(false);
      
      // Now call fix, it should replace the URL in a message with #
      if(rubricLinkReplace.fix) {
          const fixResult = await rubricLinkReplace.fix(dummyCourse, runResult);

          expect(putSpy).toHaveBeenCalledTimes(1);
          // The fixed message should have the link replaced with "#"
          const fixedMessage = discussion.message;
          expect(fixedMessage).toMatch(/<a[^>]*href="#"/);
          // check the notFailureMessage contains the title of fixed discussion
          expect(fixResult.messages[0].bodyLines[0]).toContain("Discussion with rubric");
      }
    });

    it("should call run inside fix if result parameter is not provided", async () => {
      // Here, we simulate a discussion that needs fixing.
      const discussion = createDiscussion("1", "Discussion with rubric", `<p><a href="https://example.com/rubric">View rubric</a></p>`);
      const fakeGenerator = function*() {
        yield discussion;
      };
      jest.spyOn(DiscussionKind, 'dataGenerator').mockReturnValue(fakeGenerator() as any);

      const putSpy = jest.spyOn(DiscussionKind, 'put').mockImplementation(async (_courseId, contentId, data) => {
        return {_courseId, contentId, data} as unknown as IDiscussionData;
      });

      // Call fix without the result param, so it runs the validation.
      if(rubricLinkReplace.fix) {
          const fixResult = await rubricLinkReplace.fix(dummyCourse, undefined);

          expect(putSpy).toHaveBeenCalledTimes(1);
          expect(fixResult.messages[0].bodyLines[0]).toContain("Discussion with rubric");
      }
    });

    it("should return proper error if userData is missing", async () => {
      // Simulate run returning a failure result with no userData.
      const faultyResult = testResult(false, { failureMessage: "Some error" });

      if(rubricLinkReplace.fix) {
          const fixResult= await rubricLinkReplace.fix(dummyCourse, faultyResult);

          expect(fixResult.success).toBe(false);
          expect(fixResult.messages[0].bodyLines[0]).toBe("Unable to find bad rubrics. Failed to fix.");
      }
    });
  });
});