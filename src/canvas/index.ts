// noinspection GrazieInspection

/* Very Initial refactor to JS using ChatGPT4
NOTE: Almost all of this code has had to be rewritten since then.
And starting to convert to ts
 */
/* THis has since been almost entirely rewritten. It did not do a great job at first pass.
 It kept inventing code that should work but didn't */

import {formDataify, ICanvasCallConfig} from "./canvasUtils";

import {overrideConfig} from "@/canvas/fetch/index";


export class NotImplementedException extends Error {
}

export function apiWriteConfig(method: 'POST' | 'PUT', data: Record<string, any>, baseConfig?: ICanvasCallConfig) {
    const body = formDataify(data);
    return overrideConfig({
        fetchInit: {
            method,
            body,
        }
    }, baseConfig);
}


export {overrideConfig} from "@/canvas/fetch/index";