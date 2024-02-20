export interface Dict {
    [key: string] : any,
}

export interface CanvasData extends Dict{
    id: number,
    name?: string,
}

export interface CourseData extends CanvasData{
    name: string,
}

export interface TermsData extends CanvasData{
    enrollment_terms : CanvasData[],
}