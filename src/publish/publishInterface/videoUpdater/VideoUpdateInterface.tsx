import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Alert, Spinner} from 'react-bootstrap';
import {
    resetKalturaState,
    loadMigrationsFromLocalStorage,
} from '@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice';
import {KalturaAppDispatch} from "@publish/publishInterface/videoUpdater/data/store";
import {
    fetchCourseAssignments,
    getSliceCourseAssignmentsData,
    getSliceCourseAssignmentsError,
    getSliceCourseAssignmentsStatus
} from "@/canvas-redux/courseAssignmentsSlice";
import {fetchCoursePages, getSliceCoursePagesData} from "@/canvas-redux/coursePagesSlice";
import {VideoUpdateInterfaceProps} from "@publish/publishInterface/videoUpdater/data/types";
import {selectKalturaStatus} from "@publish/publishInterface/videoUpdater/data/migrationSelectors";
import {useEffectAsync} from "@/ui/utils";
import MigrationTable from "@publish/publishInterface/videoUpdater/migrationTable/MigrationTable";
import MigrationStatusDisplay from './MigrationStatusDisplay';
import {collectMigrationDetails} from "@publish/publishInterface/videoUpdater/data/actions/collectMigrationDetails";
import {fetchCourseData, getWorkingCourseData} from "@/canvas-redux/courseDataSlice";
import Modal from "@/ui/widgets/Modal";

const VideoUpdateInterface = ({courseId}: VideoUpdateInterfaceProps) => {
    const dispatch = useDispatch<KalturaAppDispatch>();
    const [showModal, setShowModal] = useState(false);
    const courseAssignments = useSelector(getSliceCourseAssignmentsData);
    const coursePages = useSelector(getSliceCoursePagesData);
    const {migrations, status, error} = useSelector(selectKalturaStatus);
    const courseAssignmentsStatus = useSelector(getSliceCourseAssignmentsStatus);
    const courseAssignmentsError = useSelector(getSliceCourseAssignmentsError);
    const course = useSelector(getWorkingCourseData);

    useEffect(() => {
        dispatch(fetchCourseData({courseId}));
        dispatch(fetchCourseAssignments({courseId}));
        dispatch(fetchCoursePages({courseId}));
    }, [courseId]);

    // Load migrations from local storage on mount
    useEffect(() => {
        if (showModal) {
            dispatch(loadMigrationsFromLocalStorage(courseId));
        }
    }, [showModal, courseId, dispatch]);


    // Handle collecting migration details
    useEffectAsync(async () => {
        // Only collect details if the status is idle
        if (status === 'idle') {
            await handleCollectMigrationDetails();
        }
    }, [courseId, dispatch, status]);

    const handleCloseModal = () => {
        dispatch(resetKalturaState());
        setShowModal(false);
    };

    const handleCollectMigrationDetails = async () => {
        try {
            await dispatch(collectMigrationDetails({courseId}));
        } catch (error) {
            console.error("Error collecting migration details", error);
        }
    };


    return (
        <div>
            <div>{courseAssignmentsError}</div>
            <div>Course: {course?.name}</div>
            <Button onClick={() => setShowModal(true)}>Migrate Kaltura Content</Button>
            <Modal isOpen={showModal} requestClose={handleCloseModal}>
                <h2>
                    Kaltura Migration
                </h2>
                <div>
                    <MigrationStatusDisplay status={status} migrations={migrations} error={error}/>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <MigrationTable/>
                </div>
                <div>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>

                </div>
            </Modal>
        </div>
    );
};

export default VideoUpdateInterface;
