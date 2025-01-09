import {IUserData} from "@canvas/canvasDataDefs";
import {Page} from "@canvas/content/pages/Page";

export type TopicPermissions = Record<string, any>
export type FileAttachment = Record<string, any>
export type ResizeImageMessage = {
    src: string,
    image: HTMLImageElement,
    width: number,
    height?: number
}

export interface IProfile {
    user?: IUserData,
    bio?: string | null,
    displayName?: string | null,
    image?: HTMLImageElement | null,
    imageLink?: string | null,
    sourcePage?: Page | null,

}

export interface IProfileWithUser extends IProfile {
    user: IUserData
}