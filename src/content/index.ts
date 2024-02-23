import '../canvas/index';

console.log("IMPORTED CONTENT SCRIPT");

(async() => {
    console.log('running');
    console.log("RUNNING CONTENT SCRIPT");
    async function getJson(url: string) {
        console.log(url);
        const response = await fetch(url);
        console.log(response);

        const data = await response.json();
        console.log(data);
        return data;

    }
    let searchCode = prompt();
    if(!searchCode) return;
    console.log(searchCode);
    const courses = await getJson(`/api/v1/accounts/98244/courses?search_term=${searchCode}`);
    console.log(courses);
    let course = getCourseToNavTo(searchCode, courses);

    let url =`/accounts/98244?search_term=${searchCode}`;
    if (course  && courses.length <  4) {
        url = `/courses/${course.id}`;
    }

    console.log(url);
    window.open(url, "_blank");
})();

/**
 * Gets the course to navigate to. First, looks for exact code matches. Then sorts by ID. Returns null if
 * the maxMatches number is set and there are more results than the maxMatches number.
 * @param searchCode The code or string to search
 * @param courses The lost of courses
 * @param maxMatches{Number|null} If courses is longer than this, return null
 * @returns {*|null} The best matching course
 */
function getCourseToNavTo(searchCode: string, courses: { [key: string]: any }[], maxMatches: number | null = null): any | null {
    if (typeof courses === 'undefined' || courses.length === 0 || (maxMatches && courses.length < maxMatches)) {
        return null;
    } else if (courses.length === 1) {
        return courses[0];
    } else {
        let exact_code_search = /[A-Za-z-_.]+_?[a-zA-Z]{3}\d{4}/
        for(let course of courses) {
            let course_code: string = course['course_code'];
            let match_code = course['course_code'].search(exact_code_search);
            console.log(match_code);
            if (typeof match_code !== 'string') continue;
            if (match_code && match_code.toLowerCase() === searchCode.toLowerCase()) {
                return course;
            }
        }
        courses.sort((a, b) => b.id - a.id);
        return courses[0];
    }
}

export {}