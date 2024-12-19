import {genBlueprintDataForCode} from "@canvas/course/blueprint";
import {Course} from "@canvas/course/Course";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import {ContentData, IAssignmentData, IDiscussionData} from "@canvas/content/types";
import {Assignment} from "@canvas/content/assignments/Assignment";
import DiscussionKind from "@canvas/content/discussions/DiscussionKind";
import {getModuleWeekNumber, moduleGenerator} from "@canvas/course/modules";
import {ContentKind} from "@canvas/content/ContentKind";
import {
    CONTENT_KINDS,
    ContentKindInPractice,
    ContentDataType,
    getContentKindFromContent
} from "@canvas/content/determineContent";
import {getModuleInfo} from "@/ui/speedGrader/modules";
import {renderAsyncGen} from "@canvas/canvasUtils";
import {IModuleItemData} from "@canvas/canvasDataDefs";

/**
 * Retrieves the equivalent discussion data for a given assignment across multiple course blueprints.
 *
 * This function searches through the assignments in various blueprints of a course, attempting to find
 * discussions that were originally associated with a given assignment (identified by its `assignmentId`).
 * If a matching discussion is found in any blueprint, the corresponding discussion data (`IDiscussionData`) is yielded.
 * This is useful for recovering lost or missing discussion data when the original discussion ID is not available,
 * but the assignment information is accessible.
 *
 * The function processes the blueprints lazily, yielding results one by one as they are found. This ensures efficient memory usage
 * when dealing with large sets of blueprint data.
 *
 * @param {Course} course - The course from which the blueprint data is being retrieved. This course is used to find
 *                           the relevant blueprints through the `genBlueprintDataForCode` function.
 * @param {number} assignmentId - The ID of the assignment whose associated discussion data is being retrieved.
 *                                The function will search across blueprints to find discussions linked to this assignment.
 *
 * @yields {IDiscussionData} - The `IDiscussionData` object that corresponds to the found discussion, if any.
 *                              This data includes the discussion properties like `discussion_type`, `require_initial_post`, etc.
 *
 * @remarks
 * - If no discussion is found for the given assignment ID across the blueprints, the generator will complete without yielding any values.
 * - If the discussion is found, the function will yield the associated `discussion_topic` object, which can then be processed or restored as needed.
 * - The function operates asynchronously and uses a generator to lazily fetch and yield discussion data, ensuring efficient handling of large datasets.
 *
 * @example
 * const generator = getEquivalentDiscussionData(course, 123);
 * for await (const discussion of generator) {
 *     console.log(discussion);  // Process each matching discussion found
 * }
 */

// export async function* genEquivalentDiscussionData(course: {id: number, courseCode: string, accountId: number }, assignmentId: number): AsyncGenerator {
//     const blueprintGen = genBlueprintDataForCode(course.courseCode, [course.accountId]);
//     if (!blueprintGen) throw new Error("Blueprint generator not found");
//     const assignmentData = await AssignmentKind.get(course.id, assignmentId, { });
//     if(!assignmentData) return;
//     for await (const blueprint of blueprintGen) {
//         const bpModules = await renderAsyncGen(moduleGenerator(blueprint.id));
//         for await (const bpModule of bpModules) {
//             const items = bpModule.items;
//             for(const item of items) {
//                 if(item.title == assignmentData.name) {
//                     let analogAssignment: IAssignmentData;
//                     const contentKind = item.type === 'Assignment' ? AssignmentKind :
//                         item.type === 'Discussion' ? DiscussionKind :
//                             undefined;
//                     if(!contentKind) continue; //this is not a relevant data type
//                     const primaryData = await contentKind.get(blueprint.id, item.content_id);
//
//
//                     if (!analogDiscussionId) return undefined;
//                     const analogDiscussionData = await DiscussionKind.get(analogAssignment.courseId, analogDiscussionId);
//
//
//                 }
//             }
//
//         }
//         // Iterate through assignments in this blueprint
//         // Find assignments in the blueprint that match the given assignmentId
//         const moduleItem = getModuleInfo(analogAssignment.id);
//         // If a match is found, yield the associated discussion
//     }
// }
//
//
// async function getByName<Kind extends ContentKindInPractice>(items: AsyncGenerator<ContentDataType<Kind>>, search: string | ((toCheck: string) => boolean)) {
//
//   const checkFunc = typeof search != 'string' ? search : (toCheck:string) => search == toCheck;
//   for await (const item of items) {
//     const contentKind = getContentKindFromContent(item) as Kind & { getByName: (name:string) => typeof item};
//     if(!contentKind) continue;
//     if(!contentKind.dataIsThisKind(item)) throw new Error("Data constraint violation in getting content by name");
//     const name = (contentKind as { getName: (data:ContentDataType<Kind>) => string|undefined}).getName(item);
//     if(name && checkFunc(name)) return item;
//   }
//   return undefined;
// }