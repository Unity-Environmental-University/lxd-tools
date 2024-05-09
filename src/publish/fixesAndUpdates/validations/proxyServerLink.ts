import {CourseValidationTest, testResult, ValidationTestResult} from "./";
import {IAssignmentsHaver, IPagesHaver, ISyllabusHaver} from "@src/canvas/course/index"

export const weeklyObjectivesTest: CourseValidationTest<IPagesHaver & IAssignmentsHaver & ISyllabusHaver> = {
    name: "Learning Objectives -> Weekly Objectives",
    description: 'Make sure weekly objectives are called "Weekly Objectives" and not "Learning Objectives" throughout',
    run: async (course, config) => {
        const proxyStub = 'localhost'
        if(Array.isArray(config?.queryParams?.include)) config.queryParams.include.push()
        let pages = await course.getPages({
            ...config,
            queryParams: {...config?.queryParams, include:[...config?.queryParams?.include, 'body']}
        });
        let assignments = await course.getAssignments({
            ...config,
           queryParams: {...config?.queryParams, include:[...config?.queryParams?.include, 'body']}
        })
        const badContent = [...pages, ...assignments].filter(item => item.body?.includes(proxyStub));

        const success = badContent.length === 0;
        const result = testResult(
            success,
            "Bad proxy link found:"
        )

        if (!success) result.links =badContent.map(content => content.htmlContentUrl)
        return result;
    },
    //fix: async(course) => {

    //}
}