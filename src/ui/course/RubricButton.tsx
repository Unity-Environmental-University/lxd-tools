import {Course} from "@canvas/course/Course";
import {
    getContentDataFromUrl, getRubric, IAssignmentData, IDiscussionData,
    IRubricAssociationData, IRubricData, postContentFunc, putContentFunc
} from "@/canvas";
import { getSingleCourse } from "@canvas/course";
import { IQuizData } from "@canvas/content/quizzes/types";
import { IPageData } from "@canvas/content/pages/types";
import {getAssignmentData} from "@canvas/content/assignments/legacy";
import {assignmentDataGen} from "@canvas/content/assignments";
import {fetchJson} from "@canvas/fetch/fetchJson";
import {deepObjectMerge, formDataify} from "@canvas/canvasUtils";
import {useState} from "react";



interface RubricButtonProps {
    course: Course,
}

export function RubricButton({course}: RubricButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function insertRubric(course: Course) {
        setIsLoading(true);
        if(!confirm("This will try to update the rubric for the assignment based on the related assignment in DEV/BP. Are you sure you want to do this?")) {
            setIsLoading(false);
            return;
        }
        console.log(
            "Inserting rubric for assignment",
            course.name,
            "in course",
            course.name
        )
        try {
            let relatedCourse: Course | undefined;
            if (course.isDev) {
                relatedCourse = await getSingleCourse('BP_' + course.baseCode, course.getAccountIds())
            } else if (course.isBlueprint()) {
                relatedCourse = await course.getParentCourse();
            } else {
                throw new Error("Course is not a blueprint or dev course");
            }

            if(!relatedCourse) throw new Error("Related course not found");

            const page = document.documentURI;
            const contentData = await getContentDataFromUrl(page, { });

            let assignment: IAssignmentData | undefined;
            let relatedAssignment: IAssignmentData | undefined;
            let result: Record<string, any> | undefined;

            if(isAssignment(contentData)) {
                assignment = contentData as IAssignmentData;
                relatedAssignment = await getAssignmentByName(relatedCourse, assignment.name);
                if(!relatedAssignment) throw new Error("Related assignment not found");
            } else if(isDiscussion(contentData)) {
                const discussion = contentData as IDiscussionData;
                if(!discussion.assignment_id) throw new Error(
                    "Discussion does not have an assignment id. This is likely because it's an ungraded discussion."
                );
                assignment = await getAssignmentData(course.id, discussion.assignment_id);
                relatedAssignment = await getDiscussionByName(relatedCourse, discussion.title);
                if(!relatedAssignment) throw new Error("Related discussion not found");
            } else {
                throw new Error("Content is not an assignment or discussion");
            }

            if(!assignment) throw new Error("Assignment data not found");
            if(!relatedAssignment) throw new Error("Related assignment data not found");
            if(!relatedAssignment.rubric_settings) throw new Error("Related assignment does not have a rubric.")

            //Get Assignment Rubric, if it has one
            let assignmentRubric: IRubricData | undefined = undefined;
            if(assignment.rubric_settings){
                assignmentRubric = await getRubric(course.id, assignment.rubric_settings?.id, {include: ["associations"]});
            }

            //Get Related Rubric
            const relatedRubric = await getRubric(relatedCourse.id, relatedAssignment.rubric_settings?.id);

            if(!relatedRubric) throw new Error("Related assignment does not have a rubric");

            //Set rubric association, if there's an assignment rubric and associations
            let rubricAssociation: IRubricAssociationData | undefined = undefined;
            if(assignmentRubric && assignmentRubric.associations) {
                for(const association of assignmentRubric.associations) {
                    if(association.association_type === "Assignment") {
                        rubricAssociation = association;
                    }
                }
                if(!rubricAssociation) throw new Error("Assignment Rubric does not have an association to the assignment to use");
            }

            if(assignmentRubric && rubricAssociation) {
                //Make an updated rubric
                const updatedRubric: Record<string, string | number | boolean> = {
                    // Required identifiers
                    'rubric_association_id': rubricAssociation.id,

                    // Rubric-level fields
                    'rubric[title]': cleanText(relatedRubric.title),
                    'rubric[free_form_criterion_comments]': (relatedRubric.free_form_criterion_comments ?? true) ? 1 : 0,
                    'rubric[skip_updating_points_possible]': 0,

                    // Association-level fields
                    'rubric_association[association_id]': rubricAssociation.association_id,
                    'rubric_association[association_type]': rubricAssociation.association_type,
                    'rubric_association[use_for_grading]': (rubricAssociation.use_for_grading ?? true) ? 1 : 0,
                    'rubric_association[hide_score_total]': (rubricAssociation.hide_score_total ?? false) ? 1 : 0,
                    'rubric_association[purpose]': rubricAssociation.purpose ?? 'grading'
                };

                // Add criteria and ratings (Canvas requires indexed hash-style keys)
                (relatedRubric.data ?? []).forEach((criterion: any, i: number) => {
                    updatedRubric[`rubric[criteria][${i}][id]`] = criterion.id ?? `new_${i}`;
                    updatedRubric[`rubric[criteria][${i}][description]`] = cleanText(criterion.description) ?? '';
                    updatedRubric[`rubric[criteria][${i}][long_description]`] = cleanText(criterion.long_description) ?? '';
                    updatedRubric[`rubric[criteria][${i}][points]`] = criterion.points ?? 0;

                    // Ratings must be fully expanded
                    (criterion.ratings ?? []).forEach((rating: any, j: number) => {
                        updatedRubric[`rubric[criteria][${i}][ratings][${j}][id]`] = rating.id ?? `new_${i}_${j}`;
                        updatedRubric[`rubric[criteria][${i}][ratings][${j}][description]`] = cleanText(rating.description) ?? '';
                        updatedRubric[`rubric[criteria][${i}][ratings][${j}][long_description]`] = cleanText(rating.long_description) ?? '';
                        updatedRubric[`rubric[criteria][${i}][ratings][${j}][points]`] = rating.points ?? 0;
                    });
                });

                result = await fetchJson(`/api/v1/courses/${course.id}/rubrics/${assignmentRubric.id}`, {
                    fetchInit: {
                        method: 'PUT',
                        body: formDataify(updatedRubric)
                    }});
            } else {
                //Create a rubric
                const newRubric: Record<string, string | number | boolean > = {
                    'rubric[title]': cleanText(relatedRubric.title),
                    'rubric[free_form_criterion_comments]': (relatedRubric.free_form_criterion_comments ?? true) ? 1 : 0,

                    'rubric_association[association_id]': assignment.id,
                    'rubric_association[association_type]': "Assignment",
                    'rubric_association[use_for_grading]': 1,
                    'rubric_association[hide_score_total]': 0,
                    'rubric_association[purpose]': "grading",
                };

                (relatedRubric.data ?? []).forEach((criterion: any, i: number) => {
                    newRubric[`rubric[criteria][${i}][id]`] = criterion.id ?? `new_${i}`;
                    newRubric[`rubric[criteria][${i}][description]`] = cleanText(criterion.description) ?? '';
                    newRubric[`rubric[criteria][${i}][long_description]`] = cleanText(criterion.long_description) ?? '';
                    newRubric[`rubric[criteria][${i}][points]`] = criterion.points ?? 0;

                    // Ratings must be fully expanded
                    (criterion.ratings ?? []).forEach((rating: any, j: number) => {
                        newRubric[`rubric[criteria][${i}][ratings][${j}][id]`] = rating.id ?? `new_${i}_${j}`;
                        newRubric[`rubric[criteria][${i}][ratings][${j}][description]`] = cleanText(rating.description) ?? '';
                        newRubric[`rubric[criteria][${i}][ratings][${j}][long_description]`] = cleanText(rating.long_description) ?? '';
                        newRubric[`rubric[criteria][${i}][ratings][${j}][points]`] = rating.points ?? 0;
                    });
                });

                //Push rubric to course
                result = await fetchJson(`/api/v1/courses/${course.id}/rubrics`, {
                    fetchInit: {
                        method: 'POST',
                        body: formDataify(newRubric)
                    }
                })
            }

            if (result && (result.id || result.rubric)) {
                    if(relatedRubric.points_possible === assignment.points_possible) {
                        alert("Rubric updated successfully!");
                    } else {
                        alert("Rubric updated successfully, but the assignment points are different from the rubric points. You may need to update the points manually.");
                    }
                } else {
                    throw new Error("Update failed: " + JSON.stringify(result));
                }
        } catch (e) {
            console.error("Rubric update error:", e);
            alert("Failed to update rubric: " + (e as Error).message);
            throw new Error("Failed to update assignment rubric");
        }
        setIsLoading(false);
    }

    function isAssignment(contentData: IDiscussionData | IAssignmentData | IPageData | IQuizData | undefined ) {
        return (typeof contentData === "object" &&
            contentData !== null &&
                "submission_types" in contentData &&
                "points_possible" in contentData
        );
    }

    function isDiscussion(contentData: IDiscussionData | IAssignmentData | IPageData | IQuizData | undefined ) {
        return ( typeof contentData === "object" &&
            contentData !== null &&
                "discussion_type" in contentData &&
                "title" in contentData
        );
    }

    async function getAssignmentByName(course: Course, name: string) {
        const assignmentGen = assignmentDataGen(course.id);

        for await(const assignment of assignmentGen) {
            if(assignment.name === name) {
               return assignment;
            }
        }
    }

    async function getDiscussionByName(course: Course, name: string) {
        const discussions = await course.getDiscussions();

        for(const discussion of discussions) {
            if(discussion.name === name) {
                const discussionData = discussion.data as IDiscussionData;
                if(!discussionData.assignment_id) throw new Error("Discussion does not have an assignment id. This is likely because it's an ungraded discussion.")
                return await getAssignmentData(course.id, discussionData.assignment_id)
            }
        }
    }

    const cleanText = (text: string): string => {
        if (typeof text !== 'string') return text;
        const parser = new DOMParser();
        const decoded = parser.parseFromString(`<!doctype html><body>${text}`, 'text/html').body.textContent;
        return decoded || text;
    };
    
    return <>
        <div className="relative inline-block">
          <button
            title="Pull the rubric from a corresponding assignment into this one."
            onClick={e => insertRubric(course)}
            disabled={isLoading}
            className="btn"
          >
            Rubric
          </button>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md backdrop-blur-sm bg-white/40">
              <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-gray-700 rounded-full"></span>
            </div>
          )}
        </div>
    </>
}

//User feedback needed
    //Are you sure?