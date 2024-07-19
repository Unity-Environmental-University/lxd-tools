import {IMigrationData} from "../index";

/**
 * From canvas api docs
 */
export const mockMigrationData: IMigrationData = {
    // the unique identifier for the migration
    "id": 370663,
    // the type of content migration
    "migration_type": "course_copy_importer",
    // the name of the content migration type
    "migration_type_title": "Canvas Cartridge Importer",
    // API url to the content migration's issues
    "migration_issues_url": "https://example.com/api/v1/courses/1/content_migrations/1/migration_issues",
    // attachment api object for the uploaded file may not be present for all
    // migrations
    "attachment": {"url": "https://example.com/api/v1/courses/1/content_migrations/1/download_archive"},
    // The api endpoint for polling the current progress
    "progress_url": "https://example.com/api/v1/progress/4",
    // The user who started the migration
    "user_id": 4,
    // Current state of the content migration: pre_processing, pre_processed,
    // running, waiting_for_select, completed, failed
    "workflow_state": "running",
    // timestamp
    "started_at": "2012-06-01T00:00:00-06:00",
    // timestamp
    "finished_at": "2012-06-01T00:00:00-06:00",
    // file uploading data, see {file:file_uploads.html File Upload Documentation}
    // for file upload workflow This works a little differently in that all the file
    // data is in the pre_attachment hash if there is no upload_url then there was
    // an attachment pre-processing error, the error message will be in the message
    // key This data will only be here after a create or update call
    "pre_attachment": {
        upload_url: '',
        "message": "file exceeded quota",
        "upload_params": {}
    }
}