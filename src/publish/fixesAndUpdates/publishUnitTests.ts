import {CourseUnitTest} from "./CourseUnitTest";
import {notInTest} from "../../canvas/fixes/index";

export type UnitTestResult = {
    success: boolean,
    message: string
}

const finalNotInGradingPolicyPara:CourseUnitTest = {
    name: "Remove Final",
    description: 'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course) => {
        const syllabus = await course.getSyllabus();
        const match = /off the final grade/gi.test(syllabus);
        return {
            success: !match,
            message: "'off the final grade' found in syllabus"
        }
    }
}


const courseCreditsInSyllabus:CourseUnitTest = {
    name: "Syllabus Credits",
    description: 'Credits displayed in summary box of syllabus',
    run: async (course) => {
        const syllabus = await course.getSyllabus();
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        let strongs = el.querySelectorAll('strong');
        const creditList = Array.from(strongs).filter((strong) => /credits/i.test(strong.innerText));
        const match = /<strong>Credits/gi.test(syllabus);
        return {
            success: creditList && creditList.length > 0,
            message: "Can't find credits in syllabus"
        }
    }
}

export default [
    finalNotInGradingPolicyPara,
    courseCreditsInSyllabus
]