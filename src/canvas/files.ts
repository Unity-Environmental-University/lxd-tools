import {formDataify} from "./canvasUtils";
import assert from "assert";

export interface IFile {
    "id": number,
    "uuid": string,
    "folder_id": number,
    "display_name": string,
    "filename": string,
    "content-type": string,
    "url": string,
    "size": number,
    "created_at": string,
    "updated_at": string,
    "unlock_at"?: string,
    "locked": boolean,
    "hidden": boolean,
    "lock_at"?: string,
    "hidden_for_user": boolean,
    "visibility_level"?: "course" | "institution" | "public" | "inherit",
    "thumbnail_url"?: string | null,
    "modified_at": string,
    // simplified content-type mapping
    "mime_class": string,
    // identifier for file in third-party transcoding service
    "media_entry_id"?: string,
    "locked_for_user": boolean,
    "lock_info"?: any,
    "lock_explanation"?: string,
    "preview_url"?: string
}

export async function uploadFile(file: File, folderId:number, url:string): Promise<void>
export async function uploadFile(file: File, path:string, url:string): Promise<void>
export async function uploadFile(file: File, folder: string|number, url:string) {
    const initialParams: Record<string, any> = {
        name: file.name,
        no_redirect: true,
        on_duplicate: 'overwrite'
    }

    if(typeof folder === 'number') initialParams.parent_folder_id = folder;
    else initialParams.parent_folder_path = folder;
    let response = await fetch(url, {
        body: formDataify(initialParams),
        method: 'POST'
    });
    const data = await response.json();
    const uploadParams = data.upload_params;
    const uploadFormData = formDataify(uploadParams);
    uploadFormData.append('file', file);


    response = await fetch(data.upload_url, {
        method: 'POST',
        body: uploadFormData,
    })
    assert(response.ok);
}

