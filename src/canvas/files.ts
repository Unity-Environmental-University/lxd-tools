import {formDataify} from "./canvasUtils";
import assert from "assert";

export async function uploadFile(file: File, path: string, url:string) {
    const initialParams = {
        name: file.name,
        no_redirect: true,
        parent_folder_path: path,
        on_duplicate: 'overwrite'
    }
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
