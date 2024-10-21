// MigrationTable.tsx
import React from 'react';
import {useSelector} from 'react-redux';
import MigrationRow from './MigrationRow';
import {RootState} from "@publish/publishInterface/videoUpdater/data/store";
import {getSliceCourseAssignmentsData} from "@/canvas-redux/courseAssignmentsSlice";
import {getSliceCoursePagesData} from "@/canvas-redux/coursePagesSlice";



type MigrationTableProps = {}

const MigrationTable: React.FC<MigrationTableProps> = () => {
    const courseId = useSelector((state: RootState) => state.courseData.courseData?.courseId);
    const migrations = useSelector((state: RootState) => state.kaltura.migrations);
    const coursePages = useSelector(getSliceCoursePagesData);
    const courseAssignments = useSelector(getSliceCourseAssignmentsData);
    return (
        <div>
            {coursePages.map((page) => {
                const migration = Object.values(migrations).find(m => m.contentId === page.id && m.contentType == "Page");
                return (
                    <div key={page.id}>
                        <MigrationRow
                            rowData={migration ?? page}
                        />
                    </div>
                );
            })}

            {courseAssignments.map((assignment) => {
                const migration = Object.values(migrations).find(m => m.contentId === assignment.id && m.contentType == "Assignment");
                const startWith = migration ?? assignment;
                return (
                    <div key={assignment.id}>
                        <MigrationRow
                            rowData={migration ?? assignment}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default MigrationTable;
