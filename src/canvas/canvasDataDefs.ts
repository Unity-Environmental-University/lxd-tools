export interface Dict {
    [key: string] : any,
}

export interface ICanvasData extends Dict{
    id: number,
    name?: string,
}

export interface CourseData extends ICanvasData{
    name: string,
}

export interface TermsData extends ICanvasData{
    enrollment_terms : ICanvasData[],
}