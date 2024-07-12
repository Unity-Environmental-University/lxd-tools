export const MAX_SECTION_SLICE_SIZE = 5; //The number of sections to query data for at once.
export const FILE_HEADER = [
    'Term', 'Instructor', 'Class', 'Section', 'Student Name', 'Student Id', 'Enrollment State',
    'Week Number', 'Module', 'Assignment Type', 'Assignment Number', 'Assignment Id', 'Assignment Title',
    'Submission Status', 'Rubric Id', 'Rubric Line', 'Line Name', 'Score', 'Max Score',
].join(',') + '\n';