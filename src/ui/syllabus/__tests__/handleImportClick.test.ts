import { Course } from "@ueu/ueu-canvas";
import { Page } from "@ueu/ueu-canvas/content/pages/Page";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import {
  extractContentFromHTML,
  clearMatsSection,
  importContentIntoSyllabus,
} from "@/ui/syllabus/ImportHelpers";
import { handleImportClick } from "../handleImportClick"; // export the function

import { mockCourseData } from "@ueu/ueu-canvas";
import { mockPageData } from "@ueu/ueu-canvas/content/__mocks__/mockContentData";

jest.mock("@ueu/ueu-canvas", () => {
    return { 
        Course: {
            getSyllabus: jest.fn(),
            changeSyllabus: jest.fn(),
            getFromUrl: jest.fn(),
        },

    };
});
jest.mock("@ueu/ueu-canvas/content/pages/Page");
jest.mock("@ueu/ueu-canvas/content/pages/PageKind");
jest.mock("@/ui/syllabus/ImportHelpers");

describe("handleImportClick", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("early exits", () => {
    it("exits if no course found from URL", async () => {
        (Course.getFromUrl as jest.Mock).mockResolvedValue(null);
      
        await handleImportClick();

        expect(console.error).toHaveBeenCalledWith("No course found from URL");
        expect(PageKind.getByString).not.toHaveBeenCalled();
    });
  });

});
