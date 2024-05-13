import {ICanvasCallConfig} from "@src/canvas/canvasUtils";
import {CourseValidationTest, testResult, ValidationFixResult, ValidationTestResult} from "./";
import {IAssignmentsHaver, IDiscussionsHaver, IPagesHaver, ISyllabusHaver} from "@src/canvas/course/index"


const oldProxyRegex =/https:\/\/login\.proxy1\.unity\.edu\/login\?auth=shibboleth&url=(.*)/
const newProxyReplace = 'https://login.unity.idn.oclc.org/login?url=$1';

export const proxyServerLinkTest: CourseValidationTest<IPagesHaver & IAssignmentsHaver & IDiscussionsHaver> = {
    name: "Learning Objectives -> Weekly Objectives",
    description: 'Make sure weekly objectives are called "Weekly Objectives" and not "Learning Objectives" throughout',
    run: async (course, config) => {
        const includeBody = { queryParams: {include: ['body']}};

        let pages = await course.getPages(overrideConfig(config,includeBody));
        let assignments = await course.getAssignments(overrideConfig(config, includeBody));
        let discussions = await course.getDiscussions(overrideConfig(config, includeBody));
        const badContent = [...pages, ...assignments, ...discussions].filter(item => item.body && oldProxyRegex.test(item.body))

        const success = badContent.length === 0;
        const result = testResult(
            success,
            "Bad proxy link found:" + badContent.map(a => a.name).join(','),
        )

        if (!success) result.links = badContent.map(content => content.htmlContentUrl)
        return result;
    },
    fix: async (course) => {
        let success = false;
        let message = "Fix failed for unknown reasons";

        return <ValidationFixResult> {
            success,
            message
        }
    }
}



export function overrideConfig(source: ICanvasCallConfig | undefined, override: ICanvasCallConfig | undefined): ICanvasCallConfig {
    const out = {
        queryParams: {
            ...source?.queryParams,
            ...override?.queryParams,
        },
        fetchInit: {...source?.fetchInit, ...override?.fetchInit}
    }

    if(source?.queryParams?.include && override?.queryParams?.include) {
        out.queryParams.include = [...source?.queryParams.include, ...override?.queryParams.include]
    }

    return out;
}




export default proxyServerLinkTest;