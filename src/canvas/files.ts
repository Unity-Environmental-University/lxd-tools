import {formDataify} from "./canvasUtils";
import assert from "assert";



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
