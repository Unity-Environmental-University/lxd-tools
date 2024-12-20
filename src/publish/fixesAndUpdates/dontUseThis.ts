import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import {ICourseData} from "@canvas/courseTypes";
import {getCourseById, getCourseDataGenerator, getCourseGenerator} from "@canvas/course";
import {renderAsyncGen} from "@canvas/canvasUtils";
import {mergePagedDataGenerators} from "@canvas/fetch/getPagedDataGenerator";
import textSubEnabledBug from "@publish/fixesAndUpdates/validations/assignments/textSubEnabledBug";
import {MessageResult, testResult, ValidationResult} from "@publish/fixesAndUpdates/validations/utils";
import {baseCourseCode} from "@canvas/course/code";
import {Course} from "@canvas/course/Course";

const codesToUse = [
    "ANIM505",
    "ANIM505",
    "ANIM505",
    "ANIM510",
    "ANIM525",
    "ANIM605",
    "ANIM605",
    "ANIM610",
    "ANIM610",
    "ANIM620",
    "ANIM630",
    "ESCI501",
    "ESCI505",
    "ESCI507",
    "ESCI507",
    "GENS001",
    "GISC505",
    "GISC515",
    "GISC605",
    "GISC620",
    "HLTH510",
    "HLTH610",
    "MARI505",
    "MARI505",
    "MARI510",
    "MARI515",
    "MARI520",
    "MARI605",
    "MARI605",
    "MARI620",
    "MATH510",
    "MATH520",
    "MATH520",
    "MATH525",
    "MATH530",
    "MKTG505",
    "MKTG605",
    "PROF505",
    "PROF505",
    "PROF505",
    "PROF505",
    "PROF510",
    "PROF510",
    "PROF510",
    "PROF510",
    "PROF510",
    "PROF510",
    "PROF515",
    "PROF515",
    "PROF515",
    "PROF515",
    "PROF590",
    "PROF590",
    "PROF590",
    "PROF590",
    "PROF690",
    "PROF690",
    "PROF690",
    "PROF690",
    "PSYC505",
    "RECR520",
    "RSCH510",
    "RSCH510",
    "RSCH510",
    "RSCH510",
    "SBUS503",
    "SBUS505",
    "SBUS515",
    "SNRM505",
    "SNRM505",
    "SNRM507",
    "SNRM507",
    "SNRM510",
    "SNRM515",
    "SNRM515",
    "SUST505",
    "SUST510",
    "SUST510",
    "SUST520",
    "SUST525",
    "SUST535",
    "SUST540",
    "SUST635",
    "SUST655,",
];


export const dontUseThisValidation: CourseValidation = {
    name: "Dont use this",
    description: "If you are seeing this hallie either wanted you to and told you specifically, or hallie has forgotten to comment out a debug setting.",
    async run(course) {
        const accountId = course.rootAccountId;
        const codes = codesToUse.filter((a, i, array) => array.indexOf(a) === i).map(a => `DEV_${a}`) as string[];
        const gens = codes.map(code => getCourseDataGenerator(code, accountId));

        const failCourses = [] as ICourseData[];
        const failResults = [] as ValidationResult[];
        for (const courseGen of gens) {
            for await (const course of courseGen) {
                console.log(`running for ${course.course_code}`)
                const results = await textSubEnabledBug.run(new Course(course));
                console.log(`result for ${course.course_code}`, results.success)
                if (!results.success) {
                    failCourses.push(course);
                    failResults.push(results);
                    console.log(results.messages.flatMap(a => a.bodyLines))
                }
            }
        }

        console.log(failCourses.map(a => a.course_code))
        const failureMessage: MessageResult[] = [
            ...failCourses.map(a => ({
                bodyLines: [a.course_code ?? '???'],
                link: `https://unity.instructure.edu/courses/${a.id}`
            })),
            ...failResults.flatMap(result => result.messages)
        ];
        if (failResults.length > 0 || failCourses.length > 0) return testResult(false, {
            userData: failCourses,
            failureMessage
        })
        return testResult(true)

    }

}