import {CanvasData, IModuleItemData, LookUpTable, ModuleItemType} from "@/canvas/canvasDataDefs";
import {IDiscussionData} from "@/canvas/content/types";
import {IAssignmentData} from "@/canvas/content/assignments/types";

/**
 * A collection of assignments grabbed from the submissions that returns and finds them in various ways
 */
export class AssignmentsCollection {
    public assignmentsById: LookUpTable<IAssignmentData>;
    public discussions: IDiscussionData[];
    public discussionsById: LookUpTable<IDiscussionData>;
    public assignmentsByDiscussionId: LookUpTable<IAssignmentData>;
    public assignmentsByQuizId: LookUpTable<IAssignmentData>;

    constructor(assignments: IAssignmentData[]) {
        this.assignmentsById = {}
        for (let assignment of assignments) {
            this.assignmentsById[assignment.id] = assignment;
        }

        this.discussions = assignments.filter(assignment => assignment.hasOwnProperty('discussion_topic'))
            .map(function (assignment) {
                let discussion = assignment.discussion_topic;
                discussion.assignment = assignment;
                return discussion;
            });

        this.discussionsById = {};
        this.assignmentsByDiscussionId = {};
        for (let discussion of this.discussions) {
            this.discussionsById[discussion.id] = discussion;
            this.assignmentsByDiscussionId[discussion.id] = discussion.assignment;

        }

        this.assignmentsByQuizId = {};
        for (let assignment of assignments.filter(a => a.hasOwnProperty('quiz_id'))) {
            this.assignmentsByQuizId[assignment.quiz_id] = assignment;
        }
    }

    /**
     * Gets content by id
     * @param id the primary id of that content item (not necessarily the assignment Id)
     * The content_id property that it would have were it in a module
     * @returns {*}
     */
    getContentById(id: number): any {
        for (let collection of [
            this.assignmentsByQuizId,
            this.assignmentsByDiscussionId,
            this.assignmentsById
        ]) {
            if (collection.hasOwnProperty(id)) {
                return collection[id];
            }
        }
    }

    /**
     * Returns content type as a string if it is an Assignment, Quiz, or Discussion
     * @param contentItem
     * the content item
     * @returns {string}
     */
    getAssignmentContentType(contentItem: CanvasData): ModuleItemType {
        if(contentItem) {

        }
        if (contentItem.hasOwnProperty('submission_types')) {
            if (contentItem.submission_types.includes('external_tool')) {
                return 'ExternalTool'
            }
        }
        if (contentItem.hasOwnProperty('discussion_topic')) {
            return 'Discussion'
        }
        if (contentItem.hasOwnProperty('quiz_id')) {
            return 'Quiz'
        }
        let id = contentItem?.id;
        return "Assignment";
    }

    getModuleItemType(contentItem: IModuleItemData) {
        if (contentItem.type !== 'Assignment') return contentItem.type;
        const assignment = this.assignmentsById[contentItem.content_id];
        if(!assignment) return undefined;
        return this.getAssignmentContentType(assignment);
    }


}