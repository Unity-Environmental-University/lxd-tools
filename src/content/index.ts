import {Dict, ICanvasData} from "../canvas/canvasDataDefs";
import {Course} from "../canvas";


(async() => {

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
            for(let course of courses) {
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


    function getWeekNumber(module: Dict) {
        const regex = /(week|module) (\d+)/i;
        let match = module.name.match(regex);
        let weekNumber = !match? null : Number(match[1]);
        if (!weekNumber) {
            for (let moduleItem of module.items) {
                if (!moduleItem.hasOwnProperty('title')) {
                    continue;
                }
                let match = moduleItem.title.match(regex);
                if (match) {
                    weekNumber = match[2];
                }
            }
        }
        return weekNumber;
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
    if(!queryString) return;
    const params = queryString.split('|');
    const searchCode = params.shift();

    let targetType: string | undefined;
    let targetModuleWeekNumber
    let targetIndex
    let contentSearchString
    const paramTypeLut: Dict = {
        a : "Assignment",
        d : "Discussion",
        q : "Quiz",
        p : "Page"
    }

    for(let param of params) {
        //Test for assignment matching
        let match = /w(\d+)([adq])(\d+)$/.exec(param);
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
    const courses = await getJson(`/api/v1/accounts/98244/courses?search_term=${searchCode}`);
    if (!searchCode) return;
    let course = getCourseToNavTo(searchCode, courses);

    let url =`/accounts/98244?search_term=${searchCode}`;
    if (course  && courses.length <  4) {
        url = `/courses/${course.canvasId}`;
        if (targetModuleWeekNumber) {
            const modules = await course.getModules();
            let targetModule;
            for(let module of modules) {
                if(getWeekNumber(module) === targetModuleWeekNumber) {
                    targetModule = module;
                    break;
                }
            }

            if (targetModule && typeof targetType !== 'undefined') {
                //If it's a page, just search for the parameter string
                if(targetType === 'Page' && contentSearchString) {
                    url = `/courses/${course.canvasId}/pages?${new URLSearchParams([['search_term', contentSearchString]])}`;

                //If it's anything else, get only those items in the module and set url to the targetIndexth one.
                } else if (targetType && targetIndex) {
                    //bump index for week 1 to account for intro discussion / checking for rubric would require pulling too much data
                    if (targetType === 'Discussion' && targetModuleWeekNumber === 1 ) targetIndex++;

                    const correctTypeItems = targetModule.items.filter( (a: Dict) => a.type === targetType);
                    if (correctTypeItems.length >= targetIndex) {
                        //We discuss and number the assignments indexed at 1, but the array is indexed at 0
                        const targetItem = correctTypeItems[targetIndex - 1];
                        url = targetItem['html_url'];
                    }
                }
            }
        }
    }

    console.log(url);
    window.open(url, "_blank");
})();

