import {IProgressData} from "../migration";

export const mockProgressData: IProgressData = {
    // the ID of the Progress object
    "id": 1,
    // the context owning the job.
    "context_id": 1,
    "context_type": "Account",
    // the id of the user who started the job
    "user_id": 123,
    // the type of operation
    "tag": "course_batch_update",
    // percent completed
    "completion": 100,
    // the state of the job one of 'queued', 'running', 'completed', 'failed'
    "workflow_state": "completed",
    // the time the job was created
    "created_at": "2013-01-15T15:00:00Z",
    // the time the job was last updated
    "updated_at": "2013-01-15T15:04:00Z",
    // optional details about the job
    "message": "17 courses processed",
    // optional results of the job. omitted when job is still pending
    "results": {"id": "123"},
    // url where a progress update can be retrieved with an LTI access token
    "url": "https://canvas.example.edu/api/lti/courses/1/progress/1"
}

