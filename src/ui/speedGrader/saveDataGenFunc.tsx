import {FILE_HEADER} from "@/ui/speedGrader/consts";


export function saveDataGenFunc() {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute('display', 'none');
    return function (textArray: string[], fileName: string, type = 'text') {
        textArray = [...textArray];
        textArray.unshift(FILE_HEADER)
        let blob = new Blob(textArray, {type: type}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}