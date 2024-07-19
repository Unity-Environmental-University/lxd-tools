import {IRubricData, IRubricAssociationData, IRubricAssessmentData} from "../rubrics";
import mock = jest.mock;


import {IAssignmentData} from "@/canvas/content/assignments/types";


export const mockRubricAssociation:IRubricAssociationData = {
  association_id: 0,
  association_type: "Assignment",
  hide_outcome_results: false,
  hide_points: false,
  hide_score_total: false,
  id: 0,
  purpose: 'grading',
  rubric_id: 0,
  use_for_grading: false
}

export const mockRubricAssessment: IRubricAssessmentData = {
  artifact_attempt: 0,
  artifact_id: 0,
  artifact_type: "",
  assessment_type: 'grading',
  assessor_id: 0,
  id: 0,
  rubric_association_id: 0,
  rubric_id: 0,
  score: 0

}

export const mockRubric:IRubricData = {
  // the ID of the rubric
  "id": 1,
  // title of the rubric
  "title": "some title",
  // the context owning the rubric
  "context_id": 1,
  "context_type": "Course",
  "points_possible": 10.0,
  "reusable": false,
  "read_only": true,
  "free_form_criterion_comments": true,
  "hide_score_total": true,
  "data": null,
  "assessments": [mockRubricAssessment],
  "associations": [mockRubricAssociation]
  }


  export function mockRubricsForAssignments(
      assignmentIds:number[],
      rubricOverride?:Partial<IRubricData>,
      associationOverride?:Partial<IRubricAssociationData>
  ) {

    return assignmentIds.map((association_id, index) => {
      let rubric_id = 1000 + index;
      return {
        ...mockRubric,
        id: rubric_id,
        associations: [{...mockRubricAssociation, rubric_id, association_id, ...associationOverride}],
        ...rubricOverride
      }
    })
  }


  export default mockRubric;