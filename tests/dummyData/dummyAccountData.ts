import {IAccountData} from "../../src/canvas/canvasDataDefs";

/**
 * From Canvas Api Docs - https://canvas.instructure.com/doc/api/accounts.html
 */
export const dummyAccountData: IAccountData = {
    // the ID of the Account object
    "id": 2,
    // The display name of the account
    "name": "Canvas Account",
    // The UUID of the account
    "uuid": "WvAHhY5FINzq5IyRIJybGeiXyFkG3SqHUPb7jZY5",
    // The account's parent ID, or null if this is the root account
    "parent_account_id": 1,
    // The ID of the root account, or null if this is the root account
    "root_account_id": 1,
    // The storage quota for the account in megabytes, if not otherwise specified
    "default_storage_quota_mb": 500,
    // The storage quota for a user in the account in megabytes, if not otherwise
    // specified
    "default_user_storage_quota_mb": 50,
    // The storage quota for a group in the account in megabytes, if not otherwise
    // specified
    "default_group_storage_quota_mb": 50,
    // The default time zone of the account. Allowed time zones are
    // {http://www.iana.org/time-zones IANA time zones} or friendlier
    // {http://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html Ruby on Rails
    // time zones}.
    "default_time_zone": "America/Denver",
    // The account's identifier in the Student Information System. Only included if
    // the user has permission to view SIS information.
    "sis_account_id": "123xyz",
    // The account's identifier in the Student Information System. Only included if
    // the user has permission to view SIS information.
    "integration_id": "123xyz",
    // The id of the SIS import if created through SIS. Only included if the user
    // has permission to manage SIS information.
    "sis_import_id": 12,
    // The account's identifier that is sent as context_id in LTI launches.
    "lti_guid": "123xyz",
    // The state of the account. Can be 'active' or 'deleted'.
    "workflow_state": "active"
}