import { CourseFixValidation, CourseValidation } from "@/publish/fixesAndUpdates/validations/types";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import { ValidationResult } from "@publish/fixesAndUpdates/validations/utils";

type KalturaLtiData = Record<string, string>[];

const BASE = "https://unity.instructure.com/api/v1"
const NEW_W = 960
const NEW_H = 540
const OLD_W = 608
const OLD_H = 342
const NEW_SIZE = `${NEW_W}x${NEW_H}`

// we don't use bearer token because the user is logged in & extension
// operates without need for it - but to get PUT to work we need csrf token
function getCsrfToken() {
    return decodeURIComponent(
        document.cookie.split('; ')
            .find(c => c.startsWith('_csrf_token='))
            ?.split('=')[1] ?? ''
    );
}

const run: CourseValidation<{ id: number }, KalturaLtiData>["run"] = async ({ id }) => {
    const lti_links_url = `${BASE}/courses/${id}/lti_resource_links`
    try {
        const response = await fetch(lti_links_url)

        // TODO how should errors be handled? How does fetchJson do it and should I just use that?
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const lti_data:Record<string, string | undefined>[] = await response.json()

        const bad_lti_data = lti_data.filter(                                                                                                                                                      
            (data): data is Record<string, string> =>
                data.url?.includes(`${OLD_W}x${OLD_H}`) ?? false
        );

        if(bad_lti_data.length === 0){
            // return "No issues"
            return testResult(true, {
                notFailureMessage: "No Kaltura size issues.",
            })
        }
        else{
            // return the bad links
            return testResult(false, {
                failureMessage: "Kaltura videos in course are wrong size",
                userData: bad_lti_data
            })
        }
    }
    catch (error) {
        console.error(
            error instanceof Error ? error.message : error
        )
        // return lti links not found
        return testResult("unknown", {
            notFailureMessage: "LTI endpoint not found. "
        });
    }
};

const fix: CourseFixValidation<{ id: number }, KalturaLtiData>["fix"] = async (
    course,
    result?: ValidationResult<KalturaLtiData>
) => {
    // re-run if we don't have result data from whatever's passed in to this when called
    result ??= await run(course);
    const { userData: bad_lti_data } = result;

    // no bad lti resources, no need to fix them
    if (!bad_lti_data) return testResult(true, { notFailureMessage: "No Kaltura size issues." });

    let update_count = 0
    for(const data of bad_lti_data){
        const parts = data.url.split(`/${OLD_W}x${OLD_H}/`)
        const newURL = `${parts[0]}/${NEW_SIZE}/${parts[1]}` //TODO hardcoded splits messy
        const update_endpt = `${BASE}/courses/${course.id}/lti_resource_links/${data.id}`
        try{
            const response = await fetch(update_endpt, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-CSRF-Token": getCsrfToken(),
                },
                body: new URLSearchParams({ url: newURL }).toString()
            })

            if (!response.ok) {
                throw new Error(`Failed update: ${response.status}`)
            }
            
            update_count = update_count + 1
        }
        catch(err){
            console.error(err)
        }
    }

    if(update_count === bad_lti_data.length){
        return testResult(true, {
            notFailureMessage: "Kaltura videos resized successfully.",
        });
    }
    else{
        return testResult(false, {
            failureMessage: `missed ${bad_lti_data.length-update_count} vids`
        });
    }
}

export const kalturaSizeTests: CourseFixValidation<{ id: number }> = {
  // TODO doesn't really matter if its a courseFixVal or courseVal - but which is better practice?
  name: "Fix Kaltura videos in course being the wrong size",
  description: "Checks for LTI resource links with the wrong video size and updates them via API.",
  run,
  fix,
};