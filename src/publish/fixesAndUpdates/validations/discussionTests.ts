import {    // TODO location of this - courseContent or..?
    CourseFixValidation,
    CourseValidation,
    TextReplaceValidation
} from "@/publish/fixesAndUpdates/validations/types";
import DiscussionKind from "@/canvas/content/discussions/DiscussionKind"; // TODO ueu_canvas export for this is f'd up
import type { IDiscussionData } from "ueu_canvas";
import { mockDiscussionData } from "@/canvas/content/__mocks__/mockContentData"; // TODO ueu_canvas
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {ValidationResult} from "@publish/fixesAndUpdates/validations/utils";

const badUrl = "https://community.canvaslms.com/docs/DOC-1285";
const goodUrl = "https://community.instructure.com/en/kb/articles/662765-what-are-profile-settings";

// Validation to check that the 'Introductions' discussion does not contain
// the outdated link to the profile settings guide
const run: CourseValidation<{id: number}>['run'] =
    async ({id}) => {
        let discussion: IDiscussionData
        let success = true;
        let errorMessage = "";
        // get the discussion by searching for 'Introductions'
        const discGen = DiscussionKind.dataGenerator(id, {queryParams: {search_term: "Introductions"}});
        // assume the first one is the right one
        const {done, value} = await discGen.next();
        // only accept if we really got a discussion back
        if (DiscussionKind.dataIsThisKind(value)) {
            discussion = value;
        }
        else {
            return testResult("unknown", {
                notFailureMessage: "Introductions Discussion not found. ",
            });
        }
        
        // fail if the bad URL is found in the discussion body
        if (discussion.message.includes(badUrl)) {
            success = false;
            errorMessage = `Discussion contains outdated link: ${badUrl}`;
        }

        return testResult(success, {
            notFailureMessage: "Profile settings link is up to date.",
            failureMessage: errorMessage,
            userData: discussion,
        });
    };

const fix: CourseFixValidation<{id: number}, IDiscussionData>['fix'] = 
    async (course, result?: ValidationResult<IDiscussionData>) => {
        // prepare mock data to return if update fails
        //const mockddata: IDiscussionData = mockDiscussionData;   // TODO i did this because I really was fighting using <any> like updateSupportPage does
        // re-run if we don't have result data from whatever's passed in to this when called
        result ??= await run(course);
        // pull userData out of result and rename to discussion for convenience
        const {userData: discussion} = result;
        if (!discussion || !DiscussionKind.dataIsThisKind(discussion)) {
            return testResult(false, {
                failureMessage: "Unable to find bad link. Failed to fix.",
            });
        }
        
        // replace bad URL with good URL in discussion body/message
        const updatedMessage = discussion.message.replaceAll(badUrl, goodUrl);
        try{
            const newDiscData = await DiscussionKind.put(course.id, discussion.id, {
                message: updatedMessage
            });

            if (newDiscData) {
                return testResult(true, {
                    notFailureMessage: "profile guide link updated successfully.",
                    userData: newDiscData,
                });
            } else {
                return testResult(false, {
                    failureMessage: "Failed to update profile guide link.",
                });
            }
        }
        catch (error) {
            const failureMessage = error instanceof Error ? error.message : "Failed due to unknown error.";
            return testResult(false, {
                failureMessage,
            });
        }
    };

export const discussionTests: CourseValidation<{id: number}> = {    // TODO doesn't really matter if its a courseFixVal or courseVal - but which is better practice?
    name: "Fix Introductions Discussion Link",
    description: "Checks for outdated link to profile settings guide in Introductions discussion and updates it.",
    run,
    fix
};
