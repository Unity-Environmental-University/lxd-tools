import {formDataify} from "./canvasUtils";
import assert from "assert";
import {fetchJson} from "@/canvas/fetch/fetchJson";

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

/**
 * Get folder ID from folder path string
 */
async function getFolderByPath(folderPath: string, courseId: number): Promise<number | null> {
    try {
        const url = `/api/v1/courses/${courseId}/folders/by_path/${encodeURIComponent(folderPath)}`;
        const folder = await fetchJson(url) as Array<{id: number}>;
        return folder[0]?.id ?? null;
    } catch (e) {
        console.error(`Failed to find folder: ${folderPath}`, e);
        return null;
    }
}

/**
 * List files in a folder
 */
export async function listFilesInFolder(folderId: number): Promise<IFile[]> {
    try {
        const url = `/api/v1/folders/${folderId}/files`;
        return await fetchJson(url) as IFile[];
    } catch (e) {
        console.error(`Failed to list files in folder ${folderId}`, e);
        return [];
    }
}

/**
 * Delete a file by ID
 */
export async function deleteFile(fileId: number, courseId: number): Promise<boolean> {
    try {
        const url = `/api/v1/courses/${courseId}/files/${fileId}`;
        const response = await fetch(url, { method: 'DELETE' });
        return response.ok;
    } catch (e) {
        console.error(`Failed to delete file ${fileId}`, e);
        return false;
    }
}

/**
 * Find and delete existing file with same name in folder (by path or ID)
 * Returns true if old file was found and deleted
 */
async function deleteExistingFile(
    fileName: string,
    folder: string | number,
    courseId: number
): Promise<boolean> {
    try {
        let folderId: number | null = null;

        if (typeof folder === 'number') {
            folderId = folder;
        } else {
            folderId = await getFolderByPath(folder, courseId);
        }

        if (!folderId) {
            console.warn(`Could not resolve folder for cleanup: ${folder}`);
            return false;
        }

        const existingFiles = await listFilesInFolder(folderId);
        const existingFile = existingFiles.find(f => f.filename === fileName);

        if (existingFile) {
            console.log(`Deleting old file: ${fileName} (ID: ${existingFile.id})`);
            const deleted = await deleteFile(existingFile.id, courseId);
            if (deleted) {
                // Wait a moment for Canvas to process deletion
                await new Promise(resolve => setTimeout(resolve, 500));
                return true;
            }
        }

        return false;
    } catch (e) {
        console.error(`Error during file cleanup for ${fileName}:`, e);
        return false;
    }
}

export async function uploadFile(file: File, folderId:number, url:string, options?: {courseId?: number, replaceExisting?: boolean}): Promise<void>
export async function uploadFile(file: File, path:string, url:string, options?: {courseId?: number, replaceExisting?: boolean}): Promise<void>
export async function uploadFile(file: File, folder: string|number, url:string, options?: {courseId?: number, replaceExisting?: boolean}) {
    // If replaceExisting is true and we have courseId, explicitly delete old file first
    if (options?.replaceExisting && options?.courseId) {
        await deleteExistingFile(file.name, folder, options.courseId);
    }

    const initialParams: Record<string, any> = {
        name: file.name,
        no_redirect: true,
        on_duplicate: 'overwrite' // Keep this for backwards compatibility
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

    // If we explicitly replaced, wait a moment for Canvas to process
    if (options?.replaceExisting) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

