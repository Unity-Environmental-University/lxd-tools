import { CourseFixValidation, CourseValidation } from "@/publish/fixesAndUpdates/validations/types";
import { testResult, ValidationResult } from "@publish/fixesAndUpdates/validations/utils";
import { getPagedDataGenerator } from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import { formDataify } from "@ueu/ueu-canvas/canvasUtils";

type KalturaLtiItem = {
    id: number;
    url: string;
    [key: string]: any;
};

type KalturaLtiData = KalturaLtiItem[];

const NEW_W = 960;
const NEW_H = 540;
const OLD_W = 608;
const OLD_H = 342;
const OLD_SIZE = `${OLD_W}x${OLD_H}`;
const NEW_SIZE = `${NEW_W}x${NEW_H}`;
const OLD_PLAYER_SIZE_SEGMENT = `playerSize/${OLD_SIZE}/`;
const NEW_PLAYER_SIZE_SEGMENT = `playerSize/${NEW_SIZE}/`;

const run: CourseValidation<{ id: number }, KalturaLtiData>["run"] = async ({ id }) => {
    const lti_links_url = `/api/v1/courses/${id}/lti_resource_links`;
    try {
        const lti_data: KalturaLtiItem[] = [];
        for await (const item of getPagedDataGenerator<KalturaLtiItem>(lti_links_url)) {
            lti_data.push(item);
        }

        const bad_lti_data = lti_data.filter(data =>
            data.url?.toLowerCase().includes('kaltura') &&
            data.url.includes(OLD_PLAYER_SIZE_SEGMENT)
        );

        if (bad_lti_data.length === 0) {
            return testResult(true, {
                notFailureMessage: "No Kaltura size issues.",
            });
        } else {
            return testResult(false, {
                failureMessage: "Kaltura videos in course are wrong size",
                userData: bad_lti_data,
            });
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return testResult("unknown", {
            notFailureMessage: "LTI endpoint not found.",
        });
    }
};

const fix: CourseFixValidation<{ id: number }, KalturaLtiData>["fix"] = async (
    course,
    result?: ValidationResult<KalturaLtiData>
) => {
    result ??= await run(course);
    const { userData: bad_lti_data } = result;

    if (!bad_lti_data) return testResult(true, { notFailureMessage: "No Kaltura size issues." });

    let update_count = 0;
    for (const data of bad_lti_data) {
        const parts = data.url.split(OLD_PLAYER_SIZE_SEGMENT);
        if (parts.length < 2) {
            console.error(`Unexpected URL format, skipping: ${data.url}`);
            continue;
        }
        const newURL = `${parts[0]}${NEW_PLAYER_SIZE_SEGMENT}${parts[1]}`;
        const update_endpt = `/api/v1/courses/${course.id}/lti_resource_links/${data.id}`;
        try {
            const response = await fetchJson(update_endpt, {
                fetchInit: {
                    method: "PUT",
                    body: formDataify({ url: newURL }),
                },
            });
            if (response.errors) {
                throw new Error(`Failed update: ${JSON.stringify(response.errors)}`);
            }
            update_count++;
        } catch (err) {
            console.error(err);
        }
    }

    if (update_count === bad_lti_data.length) {
        return testResult(true, {
            notFailureMessage: "Kaltura videos resized successfully.",
        });
    } else {
        return testResult(false, {
            failureMessage: `missed ${bad_lti_data.length - update_count} vids`,
        });
    }
};

export const kalturaSizeTests: CourseFixValidation<{ id: number }> = {
    name: "Fix Kaltura videos in course being the wrong size",
    description: "Checks for LTI resource links with the wrong video size and updates them via API.",
    run,
    fix,
};
