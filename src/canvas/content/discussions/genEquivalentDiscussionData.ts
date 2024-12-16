import {genBlueprintDataForCode} from "@canvas/course/blueprint";
import {Course} from "@canvas/course/Course";
import {IDiscussionData} from "@canvas/type";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";

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

export async function* genEquivalentDiscussionData(course: Course, assignmentId: number): AsyncGenerator<IDiscussionData> {
  const blueprintGen = genBlueprintDataForCode(course.courseCode, [course.accountId]);
  if(!blueprintGen) throw new Error("Blueprint generator not found");
  for await (const blueprint of blueprintGen) {
    // Iterate through assignments in this blueprint
    const assignments = AssignmentKind.dataGenerator(blueprint.id);

    // Find assignments in the blueprint that match the given assignmentId
    for await (const assignment of assignments) {
      if (assignment.id === assignmentId && assignment.discussion_topic) {
        // If a match is found, yield the associated discussion
        yield assignment.discussion_topic;
      }
    }
  }
}
