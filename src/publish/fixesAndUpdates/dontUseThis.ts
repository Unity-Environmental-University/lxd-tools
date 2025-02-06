import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import {ICourseData, SectionData} from "@canvas/courseTypes";
import {getCourseData, getCourseDataGenerator, getSingleCourse} from "@canvas/course";
import {MessageResult, testResult, ValidationResult} from "@publish/fixesAndUpdates/validations/utils";
import {Course} from "@canvas/course/Course";
import {courseHasUnusedAssignments} from "@publish/fixesAndUpdates/validations/assignments/courseHasUnusedAssignments";
import {sectionDataGenerator} from "@canvas/course/blueprint";
import {batchify, renderAsyncGen} from "@canvas/canvasUtils";
import {courseHasDoubleQuizzes} from "@publish/fixesAndUpdates/validations/assignments/courseHasDoubleQuizzes";
import {
    courseHasUnlimitedAttemptQuizzes
} from "@publish/fixesAndUpdates/validations/courseContent/courseHasUnlimitedAttemptQuizzes";

const ugCodes = new Set([
    "AGRO101",
    "ANIM103",
    "ANIM205",
    "ANIM301",
    "ANIM302",
    "ANIM303",
    "ANIM304",
    "ANIM305",
    "ANIM306",
    "ANIM307",
    "ANIM310",
    "ANIM401",
    "ARTS101",
    "ARTS105",
    "BIOL103",
    "BIOL104",
    "BIOL105",
    "BIOL106",
    "BIOL201",
    "BIOL203",
    "BIOL301",
    "BIOL310",
    "BIOL315",
    "CHEM101",
    "CHEM102",
    "CHEM103",
    "CHEM104",
    "CHEM201",
    "CHEM202",
    "CHEM205",
    "COMM100",
    "COMM102",
    "COMM301",
    "COMM401",
    "ECON305",
    "ENCJ305",
    "ENCJ401",
    "ENVJ203",
    "ENVJ303",
    "ENVS101",
    "ENVS201",
    "ESCI101",
    "ESCI305",
    "EVHS405",
    "EVHW305",
    "EVPC100",
    "EVPC210",
    "EVPC211",
    "EVPC311",
    "EVPC320",
    "EVPC321",
    "EVPC490",
    "FINC201",
    "GISC101",
    "GISC307",
    "HEMP201",
    "HORT301",
    "HUMN101",
    "HUMN103",
    "MATH101",
    "MATH201",
    "MATH401",
    "MBAQ105",
    "MBAQ201",
    "MBAQ202",
    "MBAQ203",
    "MBAQ301",
    "MBAQ303",
    "MBAQ307",
    "MBAQ310",
    "MBAQ315",
    "MBAQ401",
    "MGMT201",
    "MGMT303",
    "MGMT405",
    "MKTG301",
    "PSYC101",
    "RNRG301",
    "SOCI101",
    "SPAN101",
    "SUFA200",
    "WCON201",
    "WCON301",
    "WCON303",
    "WCON305",
    "WCON307",
    "WCON403",
    "WCON405",
    "WCON405",

]);

const gradCodes = new Set([
    "ANIM505",
    "ANIM510",
    "ANIM525",
    "ANIM605",
    "ANIM610",
    "ANIM620",
    "ANIM630",
    "ESCI501",
    "ESCI505",
    "ESCI507",
    "GENS001",
    "GISC505",
    "GISC515",
    "GISC605",
    "GISC620",
    "HLTH510",
    "HLTH610",
    "MARI505",
    "MARI510",
    "MARI515",
    "MARI520",
    "MARI605",
    "MARI620",
    "MATH510",
    "MATH520",
    "MATH525",
    "MATH530",
    "MKTG505",
    "MKTG605",
    "PROF505",
    "PROF510",
    "PROF515",
    "PROF590",
    "PROF690",
    "PSYC505",
    "RECR520",
    "RSCH510",
    "SBUS503",
    "SBUS505",
    "SBUS515",
    "SNRM505",
    "SNRM507",
    "SNRM510",
    "SNRM515",
    "SUST505",
    "SUST510",
    "SUST520",
    "SUST525",
    "SUST535",
    "SUST540",
    "SUST635",
    "SUST655,",

]);

const codesToUse = [...ugCodes, ...gradCodes];

const testToRun = courseHasUnlimitedAttemptQuizzes;

export const dontUseThisValidation: CourseValidation = {
    name: "Dont use this",
    description: "If you are seeing this hallie either wanted you to and told you specifically, or hallie has forgotten to comment out a debug setting.",
    async run(course) {
        const accountId = course.rootAccountId;
        const codes = codesToUse;
        const failCourses = [] as ICourseData[];
        const failResults = [] as ValidationResult[];
        for (const code of codes) {
            //const bpCourses = await (renderAsyncGen(getCourseDataGenerator(`BP_${code}`, [accountId])));
            const devCourses = await (renderAsyncGen(getCourseDataGenerator(`DEV_${code}`, [accountId])));
            //const bpCourse = bpCourses[0];
            const devCourse = devCourses[0];

            const courses = devCourses.filter(a => !
                (a.name.includes('DEPRECATED')
                    || a.name.includes('OLD')
                    || a.name.includes('MOVED')
        )) as ICourseData[];
            // if(devCourse.name)
            // if (devCourse) courses.push(devCourse);

            // if (bpCourse) {
            //     courses.push(bpCourse);
            //     // const sections = (await renderAsyncGen<SectionData, void>(sectionDataGenerator(bpCourse.id))).slice(0, 3);
            //     //
            //     // const sectionCourses = (await Promise.all(sections.map(secData => getCourseData(secData.id))))
            //     // courses.push(...sectionCourses);
            // }

            const batches = batchify(courses, 5);

            console.log(`${code} Running for ${batches.length} batches...`);
            for (const batch of batches) {
                console.log(`running for ${batch.map(a => a.course_code).join(", ")}...`);
                const runPromises = batch.map(async (course) => {

                    return {
                        result: await testToRun.run(new Course(course)),
                        course,
                    }
                })

                const runs = await Promise.all(runPromises);
                for (const {result, course} of runs) {
                    if (!result.success) {
                        failCourses.push(course);
                        failResults.push(result);
                        console.log(result.messages.flatMap(a => a.bodyLines))
                    }
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