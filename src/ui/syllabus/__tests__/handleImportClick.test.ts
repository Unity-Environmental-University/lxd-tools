import { Course } from "@ueu/ueu-canvas";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import {
  extractContentFromHTML,
  clearMatsSection,
  importContentIntoSyllabus,
} from "@/ui/syllabus/ImportHelpers";
import { handleImportClick } from "../handleImportClick"; // export the function
import { mockPageData } from "@ueu/ueu-canvas/content/__mocks__/mockContentData";

jest.mock("@ueu/ueu-canvas", () => {
    return { 
        Course: {
            getFromUrl: jest.fn(),
        },
        // TODO add others that auto mock will not work for (page, pageKind)
    };
});
jest.mock("@ueu/ueu-canvas/content/pages/Page");
jest.mock("@ueu/ueu-canvas/content/pages/PageKind");
jest.mock("@/ui/syllabus/ImportHelpers");

const mockCourse = {
  id: "123",
  getSyllabus: jest.fn(),
  changeSyllabus: jest.fn(),
};

// just using these as mock syllabi
// doesn't matter what the content is since were mocking clearMatsSection and importContentIntoSyllabus, 
// but we want them to be different so we can test that syllabus is only updated when content changes
const gradSyllabus = jest.requireActual("@/__mocks__/syllabus.grad.html");
const galSyllabus = jest.requireActual("@/__mocks__/syllabus.gallant.html");

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

    it("exits if no page found with slug", async () => {
        (Course.getFromUrl as jest.Mock).mockResolvedValue(mockCourse);
        (PageKind.getByString as jest.Mock).mockResolvedValue({ message: "Not found" });

        await handleImportClick();
        expect(console.error).toHaveBeenCalledWith('Page with slug "week-1-learning-materials" not found:', "Not found");
        expect(mockCourse.getSyllabus).not.toHaveBeenCalled();
    });

    it("exits if no video content found on page", async () => {
        (Course.getFromUrl as jest.Mock).mockResolvedValue(mockCourse);
        (PageKind.getByString as jest.Mock).mockResolvedValue(mockPageData);
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce(null); // no video content

        await handleImportClick();
        expect(console.error).toHaveBeenCalledWith("No video content found on Week 1 Learning Materials page");
        expect(mockCourse.getSyllabus).not.toHaveBeenCalled();
    });

    it("exits if no learning materials content found on page", async () => {
        (Course.getFromUrl as jest.Mock).mockResolvedValue(mockCourse);
        (PageKind.getByString as jest.Mock).mockResolvedValue(mockPageData);
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce("<div>Video Content</div>"); // video content exists
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce(null); // no mats content

        await handleImportClick();
        expect(console.error).toHaveBeenCalledWith("No learning materials content found on Week 1 Learning Materials page");
        expect(mockCourse.getSyllabus).not.toHaveBeenCalled();
    });
  });

  describe("successful import flow", () => {
    it("calls importContentIntoSyllabus with correct insertion positions", async () => {
        (Course.getFromUrl as jest.Mock).mockResolvedValue(mockCourse);
        (PageKind.getByString as jest.Mock).mockResolvedValue(mockPageData);
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce("<div>Video Content</div>");
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce("<div>Mats Content</div>");
        mockCourse.getSyllabus.mockResolvedValue(gradSyllabus);
        (clearMatsSection as jest.Mock).mockReturnValue(galSyllabus);
        (importContentIntoSyllabus as jest.Mock).mockReturnValue(galSyllabus);

        await handleImportClick();

        expect(importContentIntoSyllabus).toHaveBeenNthCalledWith(
            1, galSyllabus, "<div>Video Content</div>", "p", "beforebegin"
        );
        expect(importContentIntoSyllabus).toHaveBeenNthCalledWith(
            2, galSyllabus, "<div>Mats Content</div>", "p", "afterend"
        );
    });


    it("imports content into syllabus and updates it", async () => {
        (Course.getFromUrl as jest.Mock).mockResolvedValue(mockCourse);
        (PageKind.getByString as jest.Mock).mockResolvedValue(mockPageData);
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce("<div>Video Content</div>");
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce("<div>Mats Content</div>");
        (mockCourse.getSyllabus as jest.Mock).mockResolvedValue(gradSyllabus);
        (clearMatsSection as jest.Mock).mockReturnValue(galSyllabus);
        (importContentIntoSyllabus as jest.Mock).mockReturnValue(galSyllabus);

        await handleImportClick();

        expect(mockCourse.changeSyllabus).toHaveBeenCalledWith(galSyllabus);
    });

    it("does not update syllabus if content is the same", async () => {
        (Course.getFromUrl as jest.Mock).mockResolvedValue(mockCourse);
        (PageKind.getByString as jest.Mock).mockResolvedValue(mockPageData);
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce("<div>Video Content</div>");
        (extractContentFromHTML as jest.Mock).mockReturnValueOnce("<div>Mats Content</div>");
        (mockCourse.getSyllabus as jest.Mock).mockResolvedValue(gradSyllabus);
        (clearMatsSection as jest.Mock).mockReturnValue(gradSyllabus);
        (importContentIntoSyllabus as jest.Mock).mockReturnValue(gradSyllabus);

        await handleImportClick();

        expect(mockCourse.changeSyllabus).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("logs error if fetching page data throws an error", async () => {
        (Course.getFromUrl as jest.Mock).mockRejectedValue(new Error("Network failure"));

        await handleImportClick();

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Error fetching Week 1"),
            expect.any(Error)
        );
    });
  });
});
