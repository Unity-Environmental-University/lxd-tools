import PageKind from "@ueu/ueu-canvas";
import {CourseValidation, RunTestFunction, FixTestFunction} from "@publish/fixesAndUpdates/validations/types";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {IPageData} from "@ueu/ueu-canvas";
import {postContentFunc} from "@ueu/ueu-canvas";
import {Course} from "@ueu/ueu-canvas";

const run: RunTestFunction<Course, IPageData> = async (course) => {

    const isDev = course.name.includes('DEV');

    if(!isDev) return testResult("not run", {
        notFailureMessage: "Not a DEV course"
    });

    const pages = PageKind.dataGenerator(course.id);

    for await (const page of pages) {
        if(page.title.includes("Course Change Log")) {
            return testResult(true, {
                notFailureMessage: "Changelog page found",
                userData: page
            })
        }
    }

    return testResult(false, {
        failureMessage: "No changelog page found"
    })
}

const fix: FixTestFunction<Course, IPageData> = async (course: Course) => {
        try {
            let courseCode = course.name.split('_')[1];
            if(courseCode.includes(':')) {
                courseCode = courseCode.split(':')[0];
            }

            const title = "Course Change Log";
            const body=
                `<h2 style="text-align: center;">${courseCode} Change Log</h2>
                <table style="border-collapse: collapse; width: 100%; height: 212px; border: 1px solid #000000;" border="1px">
                    <thead style="background: #dddddd;">
                        <tr style="height: 48px;">
                            <th style="width: 5.94589%; height: 48px;">ID</th>
                            <th style="width: 9.6675%; height: 48px;">Date</th>
                            <th style="width: 15.2416%; height: 48px;">Name</th>
                            <th style="width: 28.8104%; height: 48px;">Change(s)</th>
                            <th style="width: 26.5799%; height: 48px;">Why?</th>
                            <th style="width: 13.7546%; height: 48px;">Source of Request</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="height: 96px;">
                            <td style="width: 5.94589%; height: 96px;">e.x.</td>
                            <td style="width: 9.6675%; height: 96px;">8/27/25</td>
                            <td style="width: 15.2416%; height: 96px;">Greg Siekman</td>
                            <td style="width: 28.8104%; height: 96px;">Example Rubric - Rubric criterion "Initial post" adjusted from 25 pts. to 20 pts.</td>
                            <td style="width: 26.5799%; height: 96px;">It was weighted too highly and didn't align with weekly objectives.</td>
                            <td style="width: 13.7546%; height: 96px;">Dean</td>
                        </tr>
                        <tr style="height: 20px;">
                            <td style="width: 5.94589%; height: 20px;"></td>
                            <td style="width: 9.6675%; height: 20px;"></td>
                            <td style="width: 15.2416%; height: 20px;"></td>
                            <td style="width: 28.8104%; height: 20px;"></td>
                            <td style="width: 26.5799%; height: 20px;"></td>
                            <td style="width: 13.7546%; height: 20px;"></td>
                        </tr>
                        <tr style="height: 24px;">
                            <td style="width: 5.94589%; height: 24px;"></td>
                            <td style="width: 9.6675%; height: 24px;"></td>
                            <td style="width: 15.2416%; height: 24px;"></td>
                            <td style="width: 28.8104%; height: 24px;"></td>
                            <td style="width: 26.5799%; height: 24px;"></td>
                            <td style="width: 13.7546%; height: 24px;"></td>
                        </tr>
                        <tr style="height: 24px;">
                            <td style="width: 5.94589%; height: 24px;"></td>
                            <td style="width: 9.6675%; height: 24px;"></td>
                            <td style="width: 15.2416%; height: 24px;"></td>
                            <td style="width: 28.8104%; height: 24px;"></td>
                            <td style="width: 26.5799%; height: 24px;"></td>
                            <td style="width: 13.7546%; height: 24px;"></td>
                        </tr>
                    </tbody>
                </table>
                <p>&nbsp;</p>`;

            const getPagePostUrl = (courseId: number) => `/api/v1/courses/${courseId}/pages`;
            const postChangePage = postContentFunc(getPagePostUrl);

            await postChangePage(course.id, {
                wiki_page: {title, body}
            });

            const pages = PageKind.dataGenerator(course.id);
            for await (const page of pages) {
                if(page.title.includes("Course Change Log")) {
                    return testResult<IPageData>(true, {
                        notFailureMessage: "Changelog page created successfully",
                        userData: page
                    })
                }
            }

            return testResult<IPageData>(false, {
                failureMessage: "Page creation request sent, but page was not found afterward",
            })

        } catch(e) {
            return testResult<IPageData>(false, {
                failureMessage: "Failed to create changelog page",
                userData: e as IPageData,
            })
        }
    }

export const changelogPageTest: CourseValidation = {
    name: "Changelog exists on DEV course",
    description: "DEV courses have a changelog page where changes can be listed.",
    run,
    fix
}