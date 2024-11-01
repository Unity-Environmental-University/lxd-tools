import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Alert} from 'react-bootstrap';
import {
    resetKalturaState,
    loadMigrationsFromLocalStorage, selectKalturaStatus,
} from '@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice';
import {KalturaAppDispatch, RootState} from "@publish/publishInterface/videoUpdater/data/store";
import {
    fetchCourseAssignments,
    getSliceCourseAssignmentsError,
} from "@/canvas-redux/courseAssignmentsSlice";
import {fetchCoursePages} from "@/canvas-redux/coursePagesSlice";
import {VideoUpdateInterfaceProps} from "@publish/publishInterface/videoUpdater/data/types";
import {useEffectAsync} from "@/ui/utils";
import MigrationTable from "@publish/publishInterface/videoUpdater/migrationTable/MigrationTable";
import MigrationStatusDisplay from './MigrationStatusDisplay';
import {collectMigrationDetails} from "@publish/publishInterface/videoUpdater/data/actions/collectMigrationDetails";
import {fetchCourseData, getWorkingCourseData} from "@/canvas-redux/courseDataSlice";
import Modal from "@/ui/widgets/Modal";

const VideoUpdateInterface = ({courseId}: VideoUpdateInterfaceProps) => {
    const dispatch = useDispatch<KalturaAppDispatch>();
    const [showModal, setShowModal] = useState(false);
    const {migrations, status, error} = useSelector<RootState>();
    const courseAssignmentsError = useSelector<RootState>(getSliceCourseAssignmentsError);
    const course = useSelector<RootState>(getWorkingCourseData);

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

    useEffect(() => {

        console.log(course);
    }, [course]);

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
