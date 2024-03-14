import {Dict, ICanvasData, ModuleItemType} from "../canvas/canvasDataDefs";
import {Course, getModuleWeekNumber} from "../canvas";


(async () => {

    console.log('running');

    /**
     * Gets the course to navigate to. First, looks for exact code matches. Then sorts by ID. Returns null if
     * the maxMatches number is set and there are more results than the maxMatches number.
     * @param searchCode The code or string to search
     * @param courses The lost of courses
     * @param maxMatches{Number|null} If courses is longer than this, return null
     * @returns {*|null} The best matching course
     */
    function getCourseToNavTo(searchCode: string, courses: ICanvasData[], maxMatches: number | null = null): any | null {
        if (typeof courses === 'undefined' || courses.length === 0 || (maxMatches && courses.length < maxMatches)) {
            return null;
        } else if (courses.length === 1) {
            return new Course(courses[0]);
        } else {
            let exact_code_search = /[A-Za-z-_.]+_?[a-zA-Z]{3}\d{4}/
            for (let course of courses) {
                let match_code = course.course_code.search(exact_code_search);
                console.log(match_code);
                if (typeof match_code !== 'string') continue;
                if (match_code && match_code.toLowerCase() === searchCode.toLowerCase()) {
                    return course;
                }
            }
            courses.sort((a, b) => b.id - a.id);
            return new Course(courses[0]);
        }
    }

    async function getJson(url: string) {
        console.log(url);
        const response = await fetch(url);
        console.log(response);

        const data = await response.json();
        console.log(data);
        return data;

    }

    const queryString = prompt();
    if (!queryString) return;
    const params = queryString.split('|');
    const searchCode = params.length > 0 ? params[0] : null;

    if (!searchCode) return;

    let queryUrl = `/api/v1/accounts/98244/courses?search_term=${searchCode}`;
    if (!document.documentURI.includes(".instructure.com")) {
        queryUrl = `https://unity.instructure.com/accounts/98244?search_term=${searchCode}`;
        window.open(queryUrl, "_blank");
        return;
    }

    const courses = Course.stringIsCourseCode(searchCode) ? await getJson(queryUrl) : null;
    const course: Course = courses ? getCourseToNavTo(searchCode, courses) : await Course.getFromUrl();


    let targetType: string | null = null;
    let targetModuleWeekNumber: number = NaN;
    let targetIndex: number = NaN;
    let contentSearchString: string | null = null;
    const paramTypeLut: Dict = {
        a: "Assignment",
        d: "Discussion",
        q: "Quiz",
        p: "Page"
    }

    for (let param of params) {
        //Test for assignment matching
        let match = /w(\d+)([adq])(\d+)?$/.exec(param);
        if (match) {
            targetModuleWeekNumber = parseInt(match[1]);
            targetType = paramTypeLut[match[2]];
            targetIndex = parseInt(match[3]);
        }

        //test for page search
        match = /p (.*)/.exec(param);
        if (match) {
            targetType = "page";
            contentSearchString = match[1];
        }
    }

    if (!searchCode && !course) return;

    let url = `/accounts/98244?search_term=${searchCode}`;
    let potentialUrls: string[] = [];
    if (course && (!courses || courses.length < 4)) {
        url = `/courses/${course.id}`;
        if (targetModuleWeekNumber) {
            potentialUrls = await course.getModuleItemLinks(targetModuleWeekNumber, {
                type: targetType as ModuleItemType,
                index: targetIndex,
                search: contentSearchString
            });
        }
    }

    if (potentialUrls.length > 0) {
        for(let url of potentialUrls) window.open(url, "_blank")
    } else {
        window.open(url, "_blank");
    }
})();